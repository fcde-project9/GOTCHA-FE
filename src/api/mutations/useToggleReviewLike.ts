import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post, del } from "@/api/request";
import type {
  ReviewLikeResponse,
  ReviewResponse,
  ReviewsPageResponse,
  ShopDetailResponse,
} from "@/types/api";
import { trackReviewLike } from "@/utils/analytics";

interface ToggleReviewLikeParams {
  reviewId: number;
  isLiked: boolean; // 현재 좋아요 상태 (true면 취소, false면 추가)
  shopId: number;
}

/** 리뷰의 isLiked / likeCount 를 토글하는 헬퍼 */
const toggleReview = (
  review: ReviewResponse,
  reviewId: number,
  isLiked: boolean
): ReviewResponse =>
  review.id === reviewId
    ? {
        ...review,
        isLiked: !isLiked,
        likeCount: isLiked ? review.likeCount - 1 : review.likeCount + 1,
      }
    : review;

/**
 * 리뷰 좋아요 토글 Mutation Hook
 * isLiked가 true면 DELETE (좋아요 취소), false면 POST (좋아요 추가)
 * Optimistic update로 즉시 UI를 반영하고, 실패 시 롤백합니다.
 */
export const useToggleReviewLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, isLiked }: ToggleReviewLikeParams) => {
      const url = ENDPOINTS.REVIEWS.LIKE(reviewId);
      const options = { errorMessage: "좋아요 처리에 실패했어요." };

      const result = isLiked
        ? await del<ReviewLikeResponse>(url, options)
        : await post<ReviewLikeResponse>(url, undefined, options);

      // GA 이벤트: 리뷰 좋아요 (토글 후 상태)
      trackReviewLike(reviewId, !isLiked);

      return result;
    },
    onMutate: async ({ reviewId, isLiked, shopId }) => {
      // 진행 중인 refetch 취소 (optimistic update 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: ["shops", "detail", shopId] });
      await queryClient.cancelQueries({ queryKey: queryKeys.reviews.byShop(shopId) });

      // 이전 데이터 스냅샷 저장 (롤백용)
      const previousDetail = queryClient.getQueriesData<ShopDetailResponse>({
        queryKey: ["shops", "detail", shopId],
      });
      const previousReviews = queryClient.getQueriesData<InfiniteData<ReviewsPageResponse>>({
        queryKey: queryKeys.reviews.byShop(shopId),
      });

      // Optimistic update: shop detail 캐시
      queryClient.setQueriesData<ShopDetailResponse>(
        { queryKey: ["shops", "detail", shopId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            reviews: old.reviews.map((r) => toggleReview(r, reviewId, isLiked)),
          };
        }
      );

      // Optimistic update: infinite reviews 캐시
      queryClient.setQueriesData<InfiniteData<ReviewsPageResponse>>(
        { queryKey: queryKeys.reviews.byShop(shopId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((r) => toggleReview(r, reviewId, isLiked)),
            })),
          };
        }
      );

      return { previousDetail, previousReviews };
    },
    onError: (_, { shopId }, context) => {
      // 에러 시 이전 데이터로 롤백
      context?.previousDetail?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousReviews?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      // 롤백 후 서버 데이터로 동기화
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byShop(shopId) });
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
