import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import type { ApiResponse, NearbyShopsResponse } from "@/api/types";

/**
 * 근처 가게 확인 Query Hook
 * GET /api/shops/nearby
 */
export const useCheckNearbyShops = (latitude: number, longitude: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.shops.nearby(latitude, longitude),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NearbyShopsResponse>>(
        ENDPOINTS.SHOPS.NEARBY,
        {
          params: { latitude, longitude },
        }
      );

      // success 플래그 검증
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || "근처 가게 조회에 실패했어요.");
      }

      return data.data;
    },
    enabled,
  });
};
