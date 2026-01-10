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
  latitude: number;
  longitude: number;
  mainImageUrl: string;
  openTime: string; // JSON string: {"Mon": "10:00~22:00", "Tue": null, ...}
  isOpen: boolean; // 현재 영업 여부
  distance: string; // 거리 (예: "300m", "1.2km")
  isFavorite: boolean; // 즐겨찾기 여부
}

/**
 * GET /api/shops/map 전체 응답
 */
export type ShopsMapApiResponse = ApiResponse<ShopMapResponse[]>;

/**
 * GET /api/users/me/favorites 응답 - 찜한 가게 정보
 */
export interface FavoriteShopResponse {
  id: number;
  name: string;
  address: string;
  mainImageUrl: string;
  distance: number; // 미터 단위
  isOpen: boolean;
  favoritedAt: string; // ISO 8601 형식
}

/**
 * GET /api/users/me/favorites 응답
 */
export interface FavoritesPageResponse {
  content: FavoriteShopResponse[];
  totalCount: number;
}

/**
 * GET /api/users/me/favorites 전체 응답
 */
export type FavoritesApiResponse = ApiResponse<FavoritesPageResponse>;
