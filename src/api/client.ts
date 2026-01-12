import axios from "axios";

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
  (config) => {
    // 토큰이 있으면 헤더에 추가
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

    // 401 에러 처리 (인증 실패)
    if (status === 401) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      // 리다이렉트하지 않는 페이지 목록
      // - 로그인 관련 페이지: 무한 루프 방지
      // - 찜 페이지, 마이페이지: 비로그인 상태에서도 접근 가능 (게스트 UI 표시)
      const skipRedirectPaths = [
        "/login",
        "/oauth/callback",
        "/login/nickname",
        "/favorites",
        "/mypage",
      ];
      const shouldSkipRedirect = skipRedirectPaths.some(
        (path) => currentPath === path || currentPath.startsWith(`${path}/`)
      );

      if (!shouldSkipRedirect) {
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
