import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";

/**
 * 리뷰 삭제 Mutation Hook
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useDeleteReview = (shopId: number, reviewId: number) => {
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await apiClient.delete<ApiResponse<null>>(
          ENDPOINTS.REVIEWS.DELETE(shopId, reviewId)
        );

        if (!data.success) {
          throw new Error(data.error?.message || "삭제에 실패했어요.");
        }

        return data;
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
