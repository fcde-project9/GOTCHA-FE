import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import type { FavoriteShopResponse } from "@/types/api";

/**
 * 찜한 가게 목록 조회 Query Hook
 * GET /api/users/me/favorites
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 * - 로그인 상태 + 찜 없음: []
 * - 비로그인 상태: null
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: async (): Promise<FavoriteShopResponse[] | null> => {
      try {
        const { data } =
          await apiClient.get<ApiResponse<FavoriteShopResponse[]>>("/api/users/me/favorites");

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "찜 목록을 불러오는데 실패했어요.");
        }

        return data.data;
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
