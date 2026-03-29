/**
 * 이미지 경로 상수
 * 하드코딩 방지 및 중앙 관리를 위한 상수 파일
 */

// 기본 이미지
export const DEFAULT_IMAGES = {
  /** 가게 기본 이미지 (API에서 내려오는 S3 디폴트 이미지) */
  NO_IMAGE:
    "https://gotcha-storage.s3.ap-northeast-2.amazonaws.com/prod/defaults/shop-default-v3.png",
  /** 기본 프로필 이미지 */
  PROFILE:
    "https://gotcha-storage.s3.ap-northeast-2.amazonaws.com/prod/defaults/profile-default-join.png",
  /** 가게 아이콘 (빈 상태용) */
  SHOP: "/images/shop.png",
  /** 내 제보 빈 상태 이미지 */
  MY_SHOP: "/images/my-shop.png",
  /** 가게 목록 빈 상태 이미지 */
  SHOP_LIST_EMPTY: "/images/shop-list-empty.png",
  /** 검색 아이콘 */
  SEARCH: "/images/search.png",
  /** 제보 완료 이미지 */
  REPORT_COMPLETE: "/images/report-complete.png",
} as const;

// 신고/차단/계정 관련 이미지
export const STATUS_IMAGES = {
  /** 신고 누적 안내 일러스트 */
  REPORT_WARNING: "/images/report-warning.png",
  /** 계정 정지 안내 일러스트 */
  ACCOUNT_SUSPENDED: "/images/account-suspended.png",
  /** 차단한 사용자 빈 상태 일러스트 */
  BLOCKED_USER_EMPTY: "/images/blocked-user-empty.png",
} as const;

// 지도 마커 이미지
export const MARKER_IMAGES = {
  /** 홈 지도 마커 (기본) */
  HOME: "/images/markers/home-marker.png",
  /** 홈 지도 마커 (선택) */
  HOME_SELECTED: "/images/markers/home-marker-selected.png",
  /** 제보하기 마커 */
  REPORT: "/images/markers/report-marker.png",
} as const;

// 에러 페이지 이미지
export const ERROR_IMAGES = {
  /** 404 페이지 일러스트 */
  NOT_FOUND: "/images/error-404.png",
  /** 알 수 없는 오류 일러스트 (oops..) */
  UNKNOWN: "/images/error-unknown.png",
  /** 오프라인 상태 일러스트 */
  OFFLINE: "/images/error-offline.png",
  /** 서비스 일시적 이용불가 일러스트 (SORRY..) */
  SERVICE_UNAVAILABLE: "/images/error-service-unavailable.png",
  /** 세션 만료 일러스트 (plz..) */
  SESSION_EXPIRED: "/images/error-session-expired.png",
  /** 시스템 점검 일러스트 */
  MAINTENANCE: "/images/error-maintenance.png",
} as const;

// 아이콘 이미지
export const ICON_IMAGES = {
  /** 찜 아이콘 (채움) */
  FAVORITE_FILL: "/images/icons/favorite-fill.svg",
  /** 찜 아이콘 (라인) */
  FAVORITE_LINE: "/images/icons/favorite-line.svg",
  /** 공유 아이콘 */
  SHARE: "/images/icons/share.svg",
  /** 오른쪽 화살표 아이콘 */
  ARROW_RIGHT: "/images/icons/arrow-right.svg",
} as const;

// 로고 이미지
export const LOGO_IMAGES = {
  /** 메인 로고 */
  MAIN: "/images/gotcha-logo.png",
  /** 라이트 로고 (스플래시용) */
  LIGHT: "/images/gotcha-logo-light.png",
} as const;

/**
 * 소셜 로그인 버튼용 로고 (SVG)
 * - 용도: 로그인 페이지의 소셜 로그인 버튼
 * - 경로: /images/icons/social_login/{provider}_logo.png
 */
export const SOCIAL_LOGO_IMAGES = {
  KAKAO: "/images/icons/social_login/kakaotalk_logo.svg",
  NAVER: "/images/icons/social_login/naver_logo.png",
  GOOGLE: "/images/icons/social_login/google_logo.png",
  APPLE: "/images/icons/social_login/apple_logo.png",
} as const;

/** 소셜 프로바이더 타입 - SOCIAL_LOGO_IMAGES 키에서 파생 */
export type SocialProvider = Lowercase<keyof typeof SOCIAL_LOGO_IMAGES>;

/**
 * 마이페이지 프로필용 소셜 아이콘 경로 생성 (PNG)
 * - 용도: 마이페이지 프로필 섹션의 소셜 프로바이더 표시
 * - 경로: /images/icons/{provider}.png
 */
export const getSocialProviderIcon = (provider: SocialProvider): string => {
  return `/images/icons/social_login/${provider}_logo.png`;
};
