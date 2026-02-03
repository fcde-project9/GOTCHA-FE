import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { ShopDetailResponse, ReviewSortOption } from "@/types/api";

/**
 * 가게 상세 조회 Query Hook
 *
 * @param shopId - 가게 ID
 * @param sortBy - 리뷰 정렬 옵션 (LATEST, LIKE_COUNT)
 */
export const useShopDetail = (shopId: number, sortBy: ReviewSortOption = "LATEST") => {
  return useQuery({
    queryKey: queryKeys.shops.detail(shopId, sortBy),
    queryFn: () =>
      get<ShopDetailResponse>(
        `/api/shops/${shopId}`,
        { sortBy },
        {
          errorMessage: "업체 정보를 불러오는데 실패했어요.",
        }
      ),
    enabled: shopId > 0,
    staleTime: 0,
  });
};
