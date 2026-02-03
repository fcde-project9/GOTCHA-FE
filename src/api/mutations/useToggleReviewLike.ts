import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post, del } from "@/api/request";
import type { ReviewLikeResponse } from "@/types/api";
import { trackReviewLike } from "@/utils/analytics";

interface ToggleReviewLikeParams {
  reviewId: number;
  isLiked: boolean; // 현재 좋아요 상태 (true면 취소, false면 추가)
}

/**
 * 리뷰 좋아요 토글 Mutation Hook
 * isLiked가 true면 DELETE (좋아요 취소), false면 POST (좋아요 추가)
 */
export const useToggleReviewLike = () => {
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
  });
};
