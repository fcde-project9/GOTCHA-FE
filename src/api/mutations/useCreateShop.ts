import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { CreateShopRequest, CoordinateRequest, ShopResponse } from "@/api/types";

interface CreateShopParams {
  shopData: CreateShopRequest;
  coordinate: CoordinateRequest;
}

/**
 * 가게 생성 Mutation Hook
 * POST /api/shops/save
 */
export const useCreateShop = () => {
  return useMutation({
    mutationFn: ({ shopData, coordinate }: CreateShopParams) =>
      post<ShopResponse>(ENDPOINTS.SHOPS.SAVE, shopData, {
        errorMessage: "가게 등록에 실패했어요.",
        params: coordinate as unknown as Record<string, unknown>,
      }),
  });
};
