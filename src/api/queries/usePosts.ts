import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { PostsPageResponse } from "@/types/api";

/**
 * 커뮤니티 게시글 목록 무한 스크롤 Query Hook
 * GET /api/posts?cursor=&size=20&typeId=
 * - typeId 미전달 시 전체 조회
 */
export const usePosts = (typeId?: number) => {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(typeId),
    queryFn: ({ pageParam }) =>
      get<PostsPageResponse>(
        "/api/posts",
        {
          ...(pageParam !== undefined && { cursor: pageParam }),
          size: 20,
          ...(typeId !== undefined && { typeId }),
        },
        { errorMessage: "게시글을 불러오는데 실패했어요." }
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasNext && lastPage.nextCursor !== null) {
        return lastPage.nextCursor;
      }
      return undefined;
    },
    staleTime: 0,
    retry: false,
  });
};
