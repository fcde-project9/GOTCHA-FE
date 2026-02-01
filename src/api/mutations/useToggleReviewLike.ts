import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
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
      try {
        const method = isLiked ? "delete" : "post";
        const { data } = await apiClient[method]<ApiResponse<ReviewLikeResponse>>(
          ENDPOINTS.REVIEWS.LIKE(reviewId)
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "좋아요 처리에 실패했어요.");
        }

        // GA 이벤트: 리뷰 좋아요 (토글 후 상태)
        trackReviewLike(reviewId, !isLiked);

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
  });
};
