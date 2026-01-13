import axios, { type InternalAxiosRequestConfig } from "axios";

// 커스텀 config 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _hadToken?: boolean;
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
  async (error) => {
    const status = error?.response?.status ?? 0;
    const config = error?.config as CustomAxiosRequestConfig | undefined;
    const hadToken = config?._hadToken === true;

    // 401 에러 처리 (인증 실패) - 토큰이 있었던 경우에만 처리
    if (status === 401 && hadToken) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      // 로그인 관련 페이지에서는 리다이렉트 안 함 (무한 루프 방지)
      const isAuthPage = ["/login", "/oauth/callback", "/login/nickname"].includes(currentPath);

      if (!isAuthPage) {
        // 스토리지 정리
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user_type");
        } catch {
          // ignore storage errors
        }

        // 알림 표시 후 리다이렉트
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
