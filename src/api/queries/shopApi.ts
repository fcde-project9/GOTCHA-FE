import apiClient from "@/api/client";
import {
  MapBounds,
  ShopsMapApiResponse,
  ShopDetailResponse,
  ReviewSortOption,
  ApiResponse,
} from "@/types/api";
import { getCurrentLocation } from "@/utils/geolocation";

export type ShopDetailApiResponse = ApiResponse<ShopDetailResponse>;

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

/**
 * 가게 상세 조회
 * GET /api/shops/{shopId}
 *
 * @param shopId - 가게 ID
 * @param sortBy - 리뷰 정렬 옵션 (LATEST: 최신순, LIKE_COUNT: 좋아요순)
 * @returns 가게 상세 정보 (리뷰 5개 포함)
 */
export async function fetchShopDetail(
  shopId: number,
  sortBy: ReviewSortOption = "LATEST"
): Promise<ShopDetailApiResponse> {
  const { data } = await apiClient.get<ShopDetailApiResponse>(`/api/shops/${shopId}`, {
    params: { sortBy },
  });

  return data;
}
