import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { patch } from "@/api/request";
import type { UpdateShopMainImageRequest, ShopResponse } from "@/api/types";

interface UpdateShopMainImageParams {
  shopId: number;
  data: UpdateShopMainImageRequest;
}

/**
 * 가게 대표 이미지 수정 Mutation Hook (ADMIN 전용)
 * PATCH /api/shops/{shopId}/main-image
 */
export const useUpdateShopMainImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, data }: UpdateShopMainImageParams) =>
      patch<ShopResponse>(ENDPOINTS.SHOPS.UPDATE_MAIN_IMAGE(shopId), data, {
        errorMessage: "대표 이미지 수정에 실패했어요.",
      }),
    onSuccess: (_, { shopId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
