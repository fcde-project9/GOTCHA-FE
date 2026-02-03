import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { CreateReviewRequest, ReviewResponse } from "@/types/api";

/**
 * 리뷰 작성 Mutation Hook
 * @param shopId - 가게 ID
 */
export const useCreateReview = (shopId: number) => {
  return useMutation({
    mutationFn: (request: CreateReviewRequest) =>
      post<ReviewResponse>(ENDPOINTS.REVIEWS.CREATE(shopId), request, {
        errorMessage: "작성에 실패했어요.",
      }),
  });
};
