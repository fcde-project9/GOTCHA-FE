// API 엔드포인트 상수 관리
export const ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    TOKEN: "/api/auth/token",
  },
  // 매장
  SHOPS: {
    LIST: "/shops",
    DETAIL: (id: string) => `/shops/${id}`,
    NEARBY: "/shops/nearby",
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
  // 리뷰
  REVIEWS: {
    CREATE: (shopId: number) => `/api/shops/${shopId}/reviews`,
    LIST: (shopId: number) => `/api/shops/${shopId}/reviews`,
    UPDATE: (shopId: number, reviewId: number) => `/api/shops/${shopId}/reviews/${reviewId}`,
    DELETE: (shopId: number, reviewId: number) => `/api/shops/${shopId}/reviews/${reviewId}`,
    LIKE: (reviewId: number) => `/api/shops/reviews/${reviewId}/like`,
  },
} as const;
