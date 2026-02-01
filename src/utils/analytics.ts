export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("config", GA_ID!, {
    page_path: url,
  });
};

// 이벤트 추적
type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// ========================================
// 비즈니스 이벤트 (타입 안전)
// ========================================

/** 소셜 로그인 성공 */
export const trackUserLogin = (provider: "kakao" | "google", isNewUser: boolean) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "user_login", {
    provider,
    is_new_user: isNewUser,
  });
};

/** 매장 상세 페이지 조회 */
export const trackShopView = (shopId: number, shopName: string) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "shop_view", {
    shop_id: shopId,
    shop_name: shopName,
  });
};

/** 찜하기/해제 */
export const trackFavoriteToggle = (shopId: number, isFavorite: boolean) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "favorite_toggle", {
    shop_id: shopId,
    is_favorite: isFavorite,
  });
};

/** 리뷰 작성 완료 */
export const trackReviewSubmit = (shopId: number, hasImages: boolean) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "review_submit", {
    shop_id: shopId,
    has_images: hasImages,
  });
};

/** 매장 제보 완료 */
export const trackShopReportComplete = () => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "shop_report_complete", {});
};

// ========================================
// 권장 이벤트 (사용자 여정 분석)
// ========================================

/** 지역/지하철 검색 */
export const trackMapSearch = (query: string, resultCount: number) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "map_search", {
    query,
    result_count: resultCount,
  });
};

/** 위치 권한 응답 */
export const trackLocationPermission = (granted: boolean) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "location_permission", {
    granted,
  });
};

/** 공유 버튼 클릭 */
export const trackShareClick = (shopId: number) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "share_click", {
    shop_id: shopId,
  });
};

/** 리뷰 좋아요 */
export const trackReviewLike = (reviewId: number, isLiked: boolean) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "review_like", {
    review_id: reviewId,
    is_liked: isLiked,
  });
};

/** 게스트 모드 시작 */
export const trackGuestModeStart = () => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "guest_mode_start", {});
};

// ========================================
// 선택 이벤트 (심화 분석)
// ========================================

/** 제보하기 진입 */
export const trackShopReportStart = () => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "shop_report_start", {});
};

/** 제보 중도 이탈 */
export const trackShopReportExit = (step: "location" | "register") => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "shop_report_exit", {
    step,
  });
};
