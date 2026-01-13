import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { ReviewsPageResponse, ReviewSortOption } from "@/types/api";

/**
 * 리뷰 목록 무한 스크롤 Query Hook
 * 무한 스크롤용 (페이지네이션 자동 처리)
 *
 * @param shopId - 가게 ID
 * @param sortBy - 정렬 옵션 (LATEST, LIKE_COUNT)
 * @param size - 페이지 크기
 */
export const useInfiniteReviews = (
  shopId: number,
  sortBy: ReviewSortOption = "LATEST",
  size: number = 10
) => {
  return useInfiniteQuery({
    queryKey: ["reviews", "infinite", shopId, sortBy, size],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const { data } = await apiClient.get<ApiResponse<ReviewsPageResponse>>(
          ENDPOINTS.REVIEWS.LIST(shopId),
          { params: { sortBy, page: pageParam, size } }
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
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: shopId > 0,
  });
};
