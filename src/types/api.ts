/**
 * API 공통 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * 지도 영역 (bounds) 파라미터
 */
export interface MapBounds {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
  centerLat: number;
  centerLng: number;
}

/**
 * GET /api/shops/map 응답 - 가게 정보
 */
export interface ShopMapResponse {
  id: number;
  name: string;
  mainImageUrl: string;
  openTime: string; // JSON string: {"Mon": "10:00~22:00", ...}
  openStatus: boolean;
  distance: string;
  isFavorite: boolean;
}

/**
 * GET /api/shops/map 전체 응답
 */
export type ShopsMapApiResponse = ApiResponse<ShopMapResponse[]>;
