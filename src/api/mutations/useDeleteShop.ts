import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { del } from "@/api/request";

/**
 * 가게 삭제 Mutation Hook (ADMIN 전용)
 * DELETE /api/shops/{shopId}
 */
export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopId: number) =>
      del<null>(ENDPOINTS.SHOPS.DELETE(shopId), {
        errorMessage: "가게 삭제에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
    },
  });
};
