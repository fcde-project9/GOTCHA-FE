import { useInfiniteQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { ShopImagesResponse } from "@/types/api";

/**
 * 매장 리뷰 이미지 전체 조회 무한 스크롤 Query Hook
 *
 * @param shopId - 가게 ID
 * @param enabled - 갤러리 오픈 시에만 호출 (lazy fetch)
 */
export const useShopReviewImages = (shopId: number, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.images(shopId),
    queryFn: ({ pageParam = 0 }) =>
      get<ShopImagesResponse>(
        ENDPOINTS.REVIEWS.IMAGES(shopId),
        { page: pageParam, size: 20 },
        {
          errorMessage: "이미지를 불러오는데 실패했어요.",
        }
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: shopId > 0 && enabled,
  });
};
