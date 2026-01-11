import apiClient from "@/api/client";
import { MapBounds, ShopsMapApiResponse } from "@/types/api";
import { getCurrentLocation } from "@/utils/geolocation";

/**
 * 지도 영역 내 가게 목록 조회
 * GET /api/shops/map
 *
 * @param bounds - 지도 영역 (northEast, southWest)
 * @returns 가게 목록
 *
 * @note centerLat, centerLng는 사용자의 현재 위치로 고정됩니다.
 *       현재 위치를 가져올 수 없는 경우 null을 전송합니다.
 */
export async function fetchShopsInBounds(bounds: MapBounds): Promise<ShopsMapApiResponse> {
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
      // 사용자의 현재 위치를 center로 사용, 없으면 null
      centerLat: userLocation?.latitude ?? null,
      centerLng: userLocation?.longitude ?? null,
    },
  });

  return data;
}
