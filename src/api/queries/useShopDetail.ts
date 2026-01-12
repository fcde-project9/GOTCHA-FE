import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { ShopDetailResponse, ReviewSortOption } from "@/types/api";

/**
 * 가게 상세 조회 Query Hook
 *
 * @param shopId - 가게 ID
 * @param sortBy - 리뷰 정렬 옵션 (LATEST, LIKE_COUNT)
 */
export const useShopDetail = (shopId: number, sortBy: ReviewSortOption = "LATEST") => {
  return useQuery({
    queryKey: ["shop", shopId, sortBy],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<ShopDetailResponse>>(
          `/api/shops/${shopId}`,
          { params: { sortBy } }
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "업체 정보를 불러오는데 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "업체 정보를 불러오는데 실패했습니다.");
      }
    },
    enabled: shopId > 0,
  });
};
