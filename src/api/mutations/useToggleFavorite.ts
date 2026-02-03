import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { post, del } from "@/api/request";

interface FavoriteToggleResponse {
  isFavorite: boolean;
}

/**
 * 찜 추가 Mutation Hook
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopId: number) =>
      post<FavoriteToggleResponse>(`/api/shops/${shopId}/favorite`, undefined, {
        errorMessage: "찜 추가에 실패했어요.",
      }),
    onSuccess: () => {
      // 찜 목록 및 지도 가게 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
    },
  });
};

/**
 * 찜 해제 Mutation Hook
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopId: number) =>
      del<FavoriteToggleResponse>(`/api/shops/${shopId}/favorite`, {
        errorMessage: "찜 해제에 실패했어요.",
      }),
    onSuccess: () => {
      // 찜 목록 및 지도 가게 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
    },
  });
};
