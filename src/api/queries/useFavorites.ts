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
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 * - 로그인 상태 + 찜 없음: []
 * - 비로그인 상태: null
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<FavoriteShop[] | null> => {
      try {
        const { data } =
          await apiClient.get<ApiResponse<FavoritesResponse>>("/api/users/me/favorites");

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "찜 목록을 불러오는데 실패했습니다.");
        }

        // React Query는 undefined를 허용하지 않으므로 빈 배열로 대체
        return data.data.favorites ?? [];
      } catch (error: unknown) {
        // 401 Unauthorized (비로그인 상태)는 정상적인 케이스로 처리
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          return null;
        }

        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
    retry: false, // 비로그인 상태에서 재시도하지 않음
  });
};
