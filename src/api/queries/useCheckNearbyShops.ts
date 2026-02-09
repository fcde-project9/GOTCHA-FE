import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { NearbyShopsResponse } from "@/api/types";

/**
 * 근처 가게 확인 Query Hook
 * GET /api/shops/nearby
 */
export const useCheckNearbyShops = (latitude: number, longitude: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.shops.nearby(latitude, longitude),
    queryFn: () =>
      get<NearbyShopsResponse>(
        ENDPOINTS.SHOPS.NEARBY,
        { latitude, longitude },
        {
          errorMessage: "근처 가게 조회에 실패했어요.",
        }
      ),
    enabled,
  });
};
