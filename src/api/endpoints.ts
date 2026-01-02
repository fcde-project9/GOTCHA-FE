// API 엔드포인트 상수 관리
export const ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  // 매장
  SHOPS: {
    LIST: "/shops",
    DETAIL: (id: string) => `/shops/${id}`,
    NEARBY: "/shops/nearby",
  },
  // 사용자
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
} as const;
