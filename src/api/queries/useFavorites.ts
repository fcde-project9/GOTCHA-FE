import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";

interface FavoriteShop {
  id: number;
  name: string;
  addressName: string;
  mainImageUrl: string | null;
  isOpen: boolean;
}

interface FavoritesResponse {
  favorites: FavoriteShop[];
}

/**
 * 찜한 가게 목록 조회 Query Hook
 * GET /api/users/me/favorites
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      try {
        const { data } =
          await apiClient.get<ApiResponse<FavoritesResponse>>("/api/users/me/favorites");

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "찜 목록을 불러오는데 실패했습니다.");
        }

        return data.data.favorites;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "찜 목록을 불러오는데 실패했습니다.");
      }
    },
  });
};
