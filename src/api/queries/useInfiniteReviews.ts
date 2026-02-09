import { useInfiniteQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
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
    queryKey: queryKeys.reviews.infinite(shopId, sortBy, size),
    queryFn: ({ pageParam = 0 }) =>
      get<ReviewsPageResponse>(
        ENDPOINTS.REVIEWS.LIST(shopId),
        { sortBy, page: pageParam, size },
        {
          errorMessage: "리뷰 목록을 불러오는데 실패했어요.",
        }
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: shopId > 0,
    staleTime: 0,
  });
};
