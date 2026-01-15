import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, CreateShopRequest, CoordinateRequest, ShopResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

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
    mutationFn: async ({ shopData, coordinate }: CreateShopParams) => {
      try {
        const { data } = await apiClient.post<ApiResponse<ShopResponse>>(
          ENDPOINTS.SHOPS.SAVE,
          shopData,
          {
            params: coordinate, // latitude, longitude를 query params로
          }
        );

        // success 플래그 검증
        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "가게 등록에 실패했어요.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "가게 등록에 실패했어요.");
      }
    },
  });
};
