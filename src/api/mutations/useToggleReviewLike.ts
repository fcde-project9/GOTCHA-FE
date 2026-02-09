import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post, del } from "@/api/request";
import type { ReviewLikeResponse, ShopDetailResponse } from "@/types/api";
import { trackReviewLike } from "@/utils/analytics";

interface ToggleReviewLikeParams {
  reviewId: number;
  isLiked: boolean; // 현재 좋아요 상태 (true면 취소, false면 추가)
  shopId: number;
}

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

      // 이전 데이터 스냅샷 저장 (롤백용)
      const previousData = queryClient.getQueriesData<ShopDetailResponse>({
        queryKey: ["shops", "detail", shopId],
      });

      // Optimistic update: 캐시 즉시 업데이트
      queryClient.setQueriesData<ShopDetailResponse>(
        { queryKey: ["shops", "detail", shopId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            reviews: old.reviews.map((review) =>
              review.id === reviewId
                ? {
                    ...review,
                    isLiked: !isLiked,
                    likeCount: isLiked ? review.likeCount - 1 : review.likeCount + 1,
                  }
                : review
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_, { shopId }, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, { shopId }) => {
      // 성공/실패 상관없이 서버 데이터로 동기화
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byShop(shopId) });
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
