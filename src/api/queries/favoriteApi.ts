import apiClient from "@/api/client";
import { FavoritesApiResponse, FavoriteToggleApiResponse } from "@/types/api";

/**
 * 찜한 가게 목록 조회
 * GET /api/users/me/favorites
 *
 * @returns 찜한 가게 목록
 */
export async function fetchFavorites(): Promise<FavoritesApiResponse> {
  const { data } = await apiClient.get<FavoritesApiResponse>("/api/users/me/favorites");
  return data;
}

/**
 * 찜 추가
 * POST /api/users/me/favorites/{shopId}
 *
 * @param shopId - 가게 ID
 */
export async function addFavorite(shopId: number): Promise<void> {
  await apiClient.post(`/api/users/me/favorites/${shopId}`);
}

/**
 * 찜 해제
 * DELETE /api/users/me/favorites/{shopId}
 *
 * @param shopId - 가게 ID
 */
export async function removeFavorite(shopId: number): Promise<void> {
  await apiClient.delete(`/api/users/me/favorites/${shopId}`);
}

/**
 * 찜 추가 (토글용)
 * POST /api/shops/{shopId}/favorite
 *
 * @param shopId - 가게 ID
 * @returns 찜 상태 응답
 */
export async function addShopFavorite(shopId: number): Promise<FavoriteToggleApiResponse> {
  const { data } = await apiClient.post<FavoriteToggleApiResponse>(`/api/shops/${shopId}/favorite`);
  return data;
}

/**
 * 찜 해제 (토글용)
 * DELETE /api/shops/{shopId}/favorite
 *
 * @param shopId - 가게 ID
 * @returns 찜 상태 응답
 */
export async function removeShopFavorite(shopId: number): Promise<FavoriteToggleApiResponse> {
  const { data } = await apiClient.delete<FavoriteToggleApiResponse>(
    `/api/shops/${shopId}/favorite`
  );
  return data;
}
