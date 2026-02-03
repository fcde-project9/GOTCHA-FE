import type { MapBounds, ReviewSortOption } from "@/types/api";

/**
 * Query Key Factory
 *
 * React Query의 queryKey를 중앙에서 관리합니다.
 * - 타입 안전성 보장
 * - 자동완성 지원
 * - 캐시 무효화 시 일관된 키 사용
 *
 * @example
 * // Query에서 사용
 * useQuery({ queryKey: queryKeys.shops.detail(shopId) })
 *
 * // 캐시 무효화에서 사용
 * queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
 */
export const queryKeys = {
  /**
   * 매장 관련 쿼리 키
   */
  shops: {
    /** 모든 매장 관련 쿼리의 기본 키 */
    all: ["shops"] as const,

    /** 지도 영역 내 매장 목록 */
    map: (bounds: MapBounds | null) => [...queryKeys.shops.all, "map", bounds] as const,

    /** 근처 매장 확인 */
    nearby: (latitude: number, longitude: number) =>
      [...queryKeys.shops.all, "nearby", latitude, longitude] as const,

    /** 매장 상세 정보 */
    detail: (shopId: number, sortBy?: ReviewSortOption) =>
      [...queryKeys.shops.all, "detail", shopId, sortBy] as const,
  },

  /**
   * 즐겨찾기 관련 쿼리 키
   */
  favorites: {
    /** 모든 즐겨찾기 관련 쿼리의 기본 키 */
    all: ["favorites"] as const,

    /** 즐겨찾기 목록 */
    list: () => [...queryKeys.favorites.all, "list"] as const,
  },

  /**
   * 리뷰 관련 쿼리 키
   */
  reviews: {
    /** 모든 리뷰 관련 쿼리의 기본 키 */
    all: ["reviews"] as const,

    /** 특정 매장의 리뷰 */
    byShop: (shopId: number) => [...queryKeys.reviews.all, "shop", shopId] as const,

    /** 리뷰 목록 (페이지네이션) */
    list: (shopId: number, sortBy: ReviewSortOption, page: number, size: number) =>
      [...queryKeys.reviews.byShop(shopId), sortBy, page, size] as const,

    /** 리뷰 목록 (무한 스크롤) */
    infinite: (shopId: number, sortBy: ReviewSortOption, size: number) =>
      [...queryKeys.reviews.byShop(shopId), "infinite", sortBy, size] as const,
  },

  /**
   * 사용자 관련 쿼리 키
   */
  user: {
    /** 모든 사용자 관련 쿼리의 기본 키 */
    all: ["user"] as const,

    /** 현재 로그인한 사용자 정보 */
    me: () => [...queryKeys.user.all, "me"] as const,

    /** 내가 제보한 매장 목록 */
    myReports: () => [...queryKeys.user.all, "reports"] as const,
  },
} as const;

/**
 * Query Key 타입 추출 유틸리티
 * @example
 * type ShopDetailKey = QueryKeyType<typeof queryKeys.shops.detail>;
 * // readonly ["shops", "detail", number, ReviewSortOption | undefined]
 */
export type QueryKeyType<T extends (...args: never[]) => readonly unknown[]> = ReturnType<T>;
