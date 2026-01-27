import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";

interface FavoriteToggleResponse {
  isFavorite: boolean;
}

/**
 * 찜 추가 Mutation Hook
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: number) => {
      try {
        const { data } = await apiClient.post<ApiResponse<FavoriteToggleResponse>>(
          `/api/shops/${shopId}/favorite`
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "찜 추가에 실패했어요.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // 찜 목록 및 지도 가게 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["shops", "map"] });
    },
  });
};

/**
 * 찜 해제 Mutation Hook
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: number) => {
      try {
        const { data } = await apiClient.delete<ApiResponse<FavoriteToggleResponse>>(
          `/api/shops/${shopId}/favorite`
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "찜 해제에 실패했어요.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // 찜 목록 및 지도 가게 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["shops", "map"] });
    },
  });
};
