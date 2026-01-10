import apiClient from "@/api/client";
import { MapBounds, ShopsMapApiResponse } from "@/types/api";

/**
 * 지도 영역 내 가게 목록 조회
 * GET /api/shops/map
 *
 * @param bounds - 지도 영역 (northEast, southWest, center)
 * @returns 가게 목록
 */
export async function fetchShopsInBounds(bounds: MapBounds): Promise<ShopsMapApiResponse> {
  const { data } = await apiClient.get<ShopsMapApiResponse>("/api/shops/map", {
    params: {
      northEastLat: bounds.northEastLat,
      northEastLng: bounds.northEastLng,
      southWestLat: bounds.southWestLat,
      southWestLng: bounds.southWestLng,
      centerLat: bounds.centerLat,
      centerLng: bounds.centerLng,
    },
  });

  return data;
}
