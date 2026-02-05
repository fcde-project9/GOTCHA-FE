import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { put } from "@/api/request";
import type { UpdateShopRequest, ShopResponse } from "@/api/types";

interface UpdateShopParams {
  shopId: number;
  data: UpdateShopRequest;
}

/**
 * 가게 정보 수정 Mutation Hook (ADMIN 전용)
 * PUT /api/shops/{shopId}
 */
export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, data }: UpdateShopParams) =>
      put<ShopResponse>(ENDPOINTS.SHOPS.UPDATE(shopId), data, {
        errorMessage: "가게 정보 수정에 실패했어요.",
      }),
    onSuccess: (_, { shopId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
