import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { put } from "@/api/request";
import type { UpdateReviewRequest, ReviewResponse } from "@/types/api";

/**
 * 리뷰 수정 Mutation Hook
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useUpdateReview = (shopId: number, reviewId: number) => {
  return useMutation({
    mutationFn: (request: UpdateReviewRequest) =>
      put<ReviewResponse>(ENDPOINTS.REVIEWS.UPDATE(shopId, reviewId), request, {
        errorMessage: "수정에 실패했어요.",
      }),
  });
};
