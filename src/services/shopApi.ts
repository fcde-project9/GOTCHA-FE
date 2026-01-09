import { MapBounds, ShopsMapApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * 지도 영역 내 가게 목록 조회
 * GET /api/shops/map
 *
 * @param bounds - 지도 영역 (northEast, southWest, center)
 * @returns 가게 목록
 */
export async function fetchShopsInBounds(bounds: MapBounds): Promise<ShopsMapApiResponse> {
  const queryParams = new URLSearchParams({
    northEastLat: bounds.northEastLat.toString(),
    northEastLng: bounds.northEastLng.toString(),
    southWestLat: bounds.southWestLat.toString(),
    southWestLng: bounds.southWestLng.toString(),
    centerLat: bounds.centerLat.toString(),
    centerLng: bounds.centerLng.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/shops/map?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
