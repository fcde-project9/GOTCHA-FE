import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { del } from "@/api/request";

/**
 * 리뷰 삭제 Mutation Hook
 * 리뷰 삭제 후 해당 매장의 리뷰 목록과 매장 상세 정보를 무효화합니다.
 * @param shopId - 가게 ID
 * @param reviewId - 리뷰 ID
 */
export const useDeleteReview = (shopId: number, reviewId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      del<null>(ENDPOINTS.REVIEWS.DELETE(shopId, reviewId), {
        errorMessage: "삭제에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byShop(shopId) });
      // sortBy에 관계없이 해당 shop의 모든 detail 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
