import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// 커스텀 config 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _hadToken?: boolean;
  _retry?: boolean;
}

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // 쿠키/세션 자동 전송
});

// 토큰 재발급 상태 관리 (동시 요청 처리)
let isRefreshing = false;
let refreshSubscribers: {
  onSuccess: (token: string) => void;
  onFail: (error: Error) => void;
}[] = [];

// 재발급 완료 후 대기 중인 요청들 처리
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ onSuccess }) => onSuccess(token));
  refreshSubscribers = [];
};

// 재발급 실패 시 대기 중인 요청들 에러 처리
const onRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach(({ onFail }) => onFail(error));
  refreshSubscribers = [];
};

// 재발급 대기 큐에 요청 추가
const addRefreshSubscriber = (
  onSuccess: (token: string) => void,
  onFail: (error: Error) => void
) => {
  refreshSubscribers.push({ onSuccess, onFail });
};

// 로그아웃 처리
const handleLogout = (showAlert: boolean = true) => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_type");
  } catch {
    // ignore storage errors
  }

  if (showAlert && typeof window !== "undefined") {
    alert("로그인 세션이 만료되었어요. 다시 로그인해주세요.");
    window.location.replace("/login");
  }
};

// 토큰 재발급 함수
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reissue`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    // 응답 데이터 검증
    const data = response.data?.data;
    if (!data?.accessToken || !data?.refreshToken) {
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = data;

    // 새 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return accessToken;
  } catch {
    return null;
  }
};

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // 토큰이 있으면 헤더에 추가
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // 요청 시점에 토큰이 있었음을 표시 (내부 속성으로)
        config._hadToken = true;
      }
    } catch {
      // Private Browsing 등 localStorage 접근 불가 시 무시
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const status = error?.response?.status ?? 0;
    const originalRequest = error?.config as CustomAxiosRequestConfig | undefined;
    const hadToken = originalRequest?._hadToken === true;

    // 401 에러 처리 (인증 실패) - 토큰이 있었던 경우에만 처리
    if (status === 401 && hadToken && originalRequest && !originalRequest._retry) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      // 리프레시 토큰 재발급을 시도하지 않는 페이지 목록
      const skipRefreshPaths = ["/login", "/oauth/callback", "/login/nickname"];
      const shouldSkipRefresh = skipRefreshPaths.some(
        (path) => currentPath === path || currentPath.startsWith(`${path}/`)
      );

      // reissue 요청 자체가 실패한 경우 무한 루프 방지
      if (originalRequest.url?.includes("/api/auth/reissue")) {
        handleLogout();
        return Promise.reject(error);
      }

      if (shouldSkipRefresh) {
        return Promise.reject(error);
      }

      // refreshToken이 없으면 로그아웃
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      // 이미 재발급 진행 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            (err: Error) => {
              reject(err);
            }
          );
        });
      }

      // 재발급 시작
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // 재발급 성공 → 대기 중인 요청들 처리
          isRefreshing = false;
          onRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          // 재발급 실패 → 대기 중인 요청들 에러 처리 후 로그아웃
          isRefreshing = false;
          onRefreshFailed(new Error("Token refresh failed"));
          handleLogout();
          return Promise.reject(error);
        }
      } catch {
        isRefreshing = false;
        onRefreshFailed(new Error("Token refresh failed"));
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
