import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { put } from "@/api/request";
import type { UpdateReviewRequest, ReviewResponse } from "@/types/api";

/**
 * 리뷰 수정 Mutation Hook
 * 리뷰 수정 후 해당 매장의 리뷰 목록을 무효화합니다.
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useUpdateReview = (shopId: number, reviewId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateReviewRequest) =>
      put<ReviewResponse>(ENDPOINTS.REVIEWS.UPDATE(shopId, reviewId), request, {
        errorMessage: "수정에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byShop(shopId) });
    },
  });
};
