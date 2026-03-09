// API 엔드포인트 상수 관리
export const ENDPOINTS = {
  // 인증
  AUTH: {
    LOGOUT: "/api/auth/logout",
    REISSUE: "/api/auth/reissue",
    TOKEN: "/api/auth/token",
  },
  // 매장
  SHOPS: {
    DETAIL: (id: string) => `/api/shops/${id}`,
    NEARBY: "/api/shops/nearby",
    SAVE: "/api/shops/save",
    // ADMIN 전용
    UPDATE: (shopId: number) => `/api/shops/${shopId}`,
    UPDATE_MAIN_IMAGE: (shopId: number) => `/api/shops/${shopId}/main-image`,
    DELETE: (shopId: number) => `/api/shops/${shopId}`,
  },
  // 사용자
  USER: {
    ME: "/api/users/me",
    UPDATE_NICKNAME: "/api/users/me/nickname",
    UPDATE_PROFILE_IMAGE: "/api/users/me/profile-image",
    WITHDRAW: "/api/users/me",
    MY_SHOPS: "/api/users/me/shops",
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
  // 신고
  REPORTS: {
    CREATE: "/api/reports",
  },
  // 정보 수정 제안
  SUGGESTS: {
    CREATE: (shopId: number) => `/api/shops/${shopId}/suggest`,
  },
  // 차단
  BLOCKS: {
    LIST: "/api/users/me/blocks",
    BLOCK: (userId: number) => `/api/users/${userId}/block`,
    UNBLOCK: (userId: number) => `/api/users/${userId}/block`,
  },
  // 푸시 알림
  PUSH: {
    VAPID_KEY: "/api/push/vapid-key",
    SUBSCRIBE: "/api/push/subscribe",
    REGISTER_DEVICE: "/api/push/register-device",
  },
} as const;
