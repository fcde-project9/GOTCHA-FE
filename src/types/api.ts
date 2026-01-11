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
 * 요일별 영업시간
 */
export interface OpenTime {
  Mon: string | null;
  Tue: string | null;
  Wed: string | null;
  Thu: string | null;
  Fri: string | null;
  Sat: string | null;
  Sun: string | null;
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
  openTime: OpenTime;
  isOpen: boolean;
  distance: string;
  isFavorite: boolean;
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

/**
 * POST/DELETE /api/shops/{shopId}/favorite 응답
 */
export interface FavoriteToggleResponse {
  shopId: number;
  isFavorite: boolean;
}

/**
 * POST/DELETE /api/shops/{shopId}/favorite 전체 응답
 */
export type FavoriteToggleApiResponse = ApiResponse<FavoriteToggleResponse>;
