import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { del } from "@/api/request";

/**
 * 리뷰 삭제 Mutation Hook
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useDeleteReview = (shopId: number, reviewId: number) => {
  return useMutation({
    mutationFn: () =>
      del<null>(ENDPOINTS.REVIEWS.DELETE(shopId, reviewId), {
        errorMessage: "삭제에 실패했어요.",
      }),
  });
};
