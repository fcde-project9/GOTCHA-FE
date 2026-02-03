import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { FavoriteShopResponse } from "@/types/api";

/**
 * 찜한 가게 목록 조회 Query Hook
 * GET /api/users/me/favorites
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 * - 로그인 상태 + 찜 없음: []
 * - 비로그인 상태: null
 */
export const useFavorites = () => {
  return useQuery<FavoriteShopResponse[] | null>({
    queryKey: queryKeys.favorites.all,
    queryFn: () =>
      get<FavoriteShopResponse[] | null>("/api/users/me/favorites", undefined, {
        errorMessage: "찜 목록을 불러오는데 실패했어요.",
        allowUnauthorized: true,
      }),
    staleTime: 0, // 항상 최신 데이터 refetch (전역 staleTime 1분 무시)
    retry: false,
  });
};
