import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { FavoritesPageResponse } from "@/types/api";

/**
 * 찜한 가게 목록 무한 스크롤 Query Hook
 * GET /api/users/me/favorites?page=0&size=20
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 * - 로그인 상태 + 찜 없음: content: []
 * - 비로그인 상태: null
 */
export const useFavorites = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: ({ pageParam = 0 }) =>
      get<FavoritesPageResponse | null>(
        "/api/users/me/favorites",
        { page: pageParam, size: 20 },
        {
          errorMessage: "찜 목록을 불러오는데 실패했어요.",
          allowUnauthorized: true,
        }
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // 항상 최신 데이터 refetch (전역 staleTime 1분 무시)
    retry: false,
  });
};
