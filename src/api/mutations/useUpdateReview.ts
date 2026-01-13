import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { UpdateReviewRequest, ReviewResponse } from "@/types/api";

/**
 * 리뷰 수정 Mutation Hook
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useUpdateReview = (shopId: number, reviewId: number) => {
  return useMutation({
    mutationFn: async (request: UpdateReviewRequest) => {
      try {
        const { data } = await apiClient.put<ApiResponse<ReviewResponse>>(
          ENDPOINTS.REVIEWS.UPDATE(shopId, reviewId),
          request
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "수정에 실패했어요.");
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
  });
};
