import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post } from "@/api/request";
import type { CreateShopRequest, CoordinateRequest, ShopResponse } from "@/api/types";

interface CreateShopParams {
  shopData: CreateShopRequest;
  coordinate: CoordinateRequest;
}

/**
 * 가게 생성 Mutation Hook
 * 가게 생성 후 매장 목록과 내가 제보한 목록을 무효화합니다.
 * POST /api/shops/save
 */
export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopData, coordinate }: CreateShopParams) =>
      post<ShopResponse>(ENDPOINTS.SHOPS.SAVE, shopData, {
        errorMessage: "가게 등록에 실패했어요.",
        params: coordinate as unknown as Record<string, unknown>,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.myReports() });
    },
  });
};
