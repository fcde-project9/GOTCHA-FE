import apiClient from "@/api/client";
import { FavoritesApiResponse } from "@/types/api";

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
