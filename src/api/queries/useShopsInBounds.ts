import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { extractApiError } from "@/api/types";
import type { MapBounds, ShopsMapApiResponse, ShopMapResponse } from "@/types/api";
import { getCurrentLocation } from "@/utils/geolocation";

/**
 * 지도 영역 내 가게 목록 조회 Query Hook
 * GET /api/shops/map
 *
 * @param bounds - 지도 영역 (northEast, southWest)
 * @param enabled - 쿼리 활성화 여부
 *
 * @note centerLat, centerLng는 사용자의 현재 위치로 고정됩니다.
 *       현재 위치를 가져올 수 없는 경우 null을 전송합니다.
 */
export const useShopsInBounds = (bounds: MapBounds | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shops", "map", bounds],
    queryFn: async (): Promise<ShopMapResponse[]> => {
      if (!bounds) {
        return [];
      }

      try {
        // 사용자의 현재 위치 가져오기 (5분간 캐시 사용)
        const userLocation = await getCurrentLocation({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        });

        const { data } = await apiClient.get<ShopsMapApiResponse>("/api/shops/map", {
          params: {
            northEastLat: bounds.northEastLat,
            northEastLng: bounds.northEastLng,
            southWestLat: bounds.southWestLat,
            southWestLng: bounds.southWestLng,
            centerLat: userLocation?.latitude ?? null,
            centerLng: userLocation?.longitude ?? null,
          },
        });

        if (!data.success || !data.data) {
          throw new Error("가게 목록을 불러오는데 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "가게 목록을 불러오는데 실패했습니다.");
      }
    },
    enabled: enabled && bounds !== null,
    staleTime: 30000, // 30초간 캐시 유지 (지도 이동 시 불필요한 재요청 방지)
  });
};
