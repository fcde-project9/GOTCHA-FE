import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { ReviewResponse, ReviewSortOption } from "@/types/api";

interface ReviewsPageData {
  content: ReviewResponse[];
  page: number;
  size: number;
  hasNext: boolean;
  totalCount: number;
}

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
    queryKey: ["reviews", shopId, sortBy, page, size],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<ReviewsPageData>>(
          ENDPOINTS.REVIEWS.LIST(shopId),
          { params: { sortBy, page, size } }
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "리뷰 목록을 불러오는데 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "리뷰 목록을 불러오는데 실패했습니다.");
      }
    },
    enabled: shopId > 0,
  });
};
