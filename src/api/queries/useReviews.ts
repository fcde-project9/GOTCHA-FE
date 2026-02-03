import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { ReviewsPageResponse, ReviewSortOption } from "@/types/api";

/**
 * 리뷰 목록 조회 Query Hook
 * 단일 페이지 조회용
 *
 * @param shopId - 가게 ID
 * @param sortBy - 정렬 옵션 (LATEST, LIKE_COUNT)
 * @param page - 페이지 번호
 * @param size - 페이지 크기
 */
export const useReviews = (
  shopId: number,
  sortBy: ReviewSortOption = "LATEST",
  page: number = 0,
  size: number = 10
) => {
  return useQuery({
    queryKey: queryKeys.reviews.list(shopId, sortBy, page, size),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<ReviewsPageResponse>>(
          ENDPOINTS.REVIEWS.LIST(shopId),
          { params: { sortBy, page, size } }
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "리뷰 목록을 불러오는데 실패했어요.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
    enabled: shopId > 0,
    staleTime: 0, // 항상 최신 데이터 조회
  });
};
