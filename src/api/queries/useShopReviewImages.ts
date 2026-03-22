import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { ShopImagesResponse } from "@/types/api";

/**
 * 매장 리뷰 이미지 전체 조회 Query Hook
 *
 * @param shopId - 가게 ID
 * @param enabled - 갤러리 오픈 시에만 호출 (lazy fetch)
 */
export const useShopReviewImages = (shopId: number, enabled: boolean) => {
  return useQuery({
    queryKey: queryKeys.reviews.images(shopId),
    queryFn: () =>
      get<ShopImagesResponse>(ENDPOINTS.REVIEWS.IMAGES(shopId), undefined, {
        errorMessage: "이미지를 불러오는데 실패했어요.",
      }),
    enabled: shopId > 0 && enabled,
  });
};
