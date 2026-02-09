import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
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
    queryFn: () =>
      get<ReviewsPageResponse>(
        ENDPOINTS.REVIEWS.LIST(shopId),
        { sortBy, page, size },
        {
          errorMessage: "리뷰 목록을 불러오는데 실패했어요.",
        }
      ),
    enabled: shopId > 0,
    staleTime: 0,
  });
};
