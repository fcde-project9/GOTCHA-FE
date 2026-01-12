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

/**
 * GET /api/shops/{shopId} 정렬 옵션
 */
export type ShopDetailSortOption = "LATEST" | "LIKE_COUNT";

/**
 * GET /api/shops/{shopId} 응답 - 가게 상세 정보
 */
export interface ShopDetailResponse {
  id: number;
  name: string;
  addressName: string; // 예: "서울 송파구 잠실동 40-1"
  locationHint: string; // 예: "롯데월드건물 지하1층 감성교복 앞"
  openTime: string; // JSON 문자열: {"Mon": "10:00~22:00", "Tue": null, ...}
  todayOpenTime: string; // 예: "10:00~22:00"
  isOpen: boolean;
  latitude: number;
  longitude: number;
  mainImageUrl: string;
  isFavorite: boolean;
  reviews: ReviewResponse[];
  totalReviewImageCount: number;
  recentReviewImages: string[];
}

/**
 * GET /api/shops/{shopId} 전체 응답
 */
export type ShopDetailApiResponse = ApiResponse<ShopDetailResponse>;

/**
 * 리뷰 작성자 정보
 */
export interface ReviewAuthor {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

/**
 * 리뷰 정보
 */
export interface ReviewResponse {
  id: number;
  content: string;
  imageUrls: string[];
  author: ReviewAuthor;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
  createdAt: string; // ISO 8601 형식
}

/**
 * 리뷰 목록 정렬 옵션
 */
export type ReviewSortOption = "LATEST" | "LIKE_COUNT";

/**
 * GET /api/shops/{shopId}/reviews 응답
 */
export interface ReviewsPageResponse {
  content: ReviewResponse[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

/**
 * GET /api/shops/{shopId}/reviews 전체 응답
 */
export type ShopReviewsApiResponse = ApiResponse<ReviewsPageResponse>;

/**
 * POST /api/shops/{shopId}/reviews 요청
 * 이미지는 0~10개까지 첨부 가능
 */
export interface CreateReviewRequest {
  content: string;
  imageUrls: string[]; // 이미지 업로드 후 URL 배열
}

/**
 * POST /api/shops/{shopId}/reviews 응답
 * 생성된 리뷰 정보 반환
 */
export type CreateReviewApiResponse = ApiResponse<ReviewResponse>;

/**
 * GET /api/shops/{shopId}/images 응답
 */
export interface ShopImagesResponse {
  images: string[];
  totalCount: number;
}

/**
 * GET /api/shops/{shopId}/images 전체 응답
 */
export type ShopImagesApiResponse = ApiResponse<ShopImagesResponse>;

/**
 * 이미지 업로드 폴더 타입
 */
export type ImageUploadFolder = "reviews" | "shops" | "profiles";

/**
 * POST /api/files/upload 응답
 */
export interface FileUploadResponse {
  fileUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
}

/**
 * POST /api/files/upload 전체 응답
 */
export type FileUploadApiResponse = ApiResponse<FileUploadResponse>;
