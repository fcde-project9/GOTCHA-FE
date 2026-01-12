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
    NEARBY: "/api/shops/nearby",
    SAVE: "/api/shops/save",
  },
  // 사용자
  USER: {
    ME: "/api/users/me",
    UPDATE_NICKNAME: "/api/users/me/nickname",
    UPDATE_PROFILE_IMAGE: "/api/users/me/profile-image",
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
  // 파일
  FILE: {
    UPLOAD: "/api/files/upload",
  },
} as const;
