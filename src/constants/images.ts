/**
 * 이미지 경로 상수
 * 하드코딩 방지 및 중앙 관리를 위한 상수 파일
 */

// 기본 이미지
export const DEFAULT_IMAGES = {
  /** 가게 기본 이미지 (이미지 없을 때) */
  NO_IMAGE: "/images/no-image.png",
  /** 기본 프로필 이미지 */
  PROFILE: "/images/default-profile.png",
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

// 지도 마커 이미지
export const MARKER_IMAGES = {
  /** 가게 마커 */
  SHOP: "/images/markers/shop-marker.png",
} as const;

// 에러 페이지 이미지
export const ERROR_IMAGES = {
  /** 에러 페이지 멤버 캐릭터 이미지 */
  MEMBERS: "/images/members-error.jpg",
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
 * - 경로: /images/{provider}-logo.svg
 */
export const SOCIAL_LOGO_IMAGES = {
  KAKAO: "/images/kakao-logo.svg",
  NAVER: "/images/naver-logo.svg",
  GOOGLE: "/images/google-logo.svg",
} as const;

/** 소셜 프로바이더 타입 - SOCIAL_LOGO_IMAGES 키에서 파생 */
export type SocialProvider = Lowercase<keyof typeof SOCIAL_LOGO_IMAGES>;

/**
 * 마이페이지 프로필용 소셜 아이콘 경로 생성 (PNG)
 * - 용도: 마이페이지 프로필 섹션의 소셜 프로바이더 표시
 * - 경로: /images/icons/{provider}.png
 */
export const getSocialProviderIcon = (provider: SocialProvider): string => {
  return `/images/icons/${provider}.png`;
};
