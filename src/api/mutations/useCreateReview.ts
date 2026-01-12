import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { CreateReviewRequest, ReviewResponse } from "@/types/api";

/**
 * 리뷰 작성 Mutation Hook
 * @param shopId - 가게 ID
 */
export const useCreateReview = (shopId: number) => {
  return useMutation({
    mutationFn: async (request: CreateReviewRequest) => {
      try {
        const { data } = await apiClient.post<ApiResponse<ReviewResponse>>(
          ENDPOINTS.REVIEWS.CREATE(shopId),
          request
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "리뷰 작성에 실패했습니다.");
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
