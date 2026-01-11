import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, NearbyShopsResponse } from "@/api/types";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

/**
 * 근처 가게 확인 Query Hook (50m 이내)
 * GET /api/shops/nearby
 */
export const useCheckNearbyShops = (latitude: number, longitude: number, enabled = true) => {
  return useQuery({
    queryKey: ["shops", "nearby", latitude, longitude],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NearbyShopsResponse>>(
        ENDPOINTS.SHOPS.NEARBY,
        {
          params: { latitude, longitude },
        }
      );
      return data.data!;
    },
    enabled,
  });
};
