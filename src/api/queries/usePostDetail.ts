import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { PostDetail } from "@/types/api";

/**
 * 게시글 상세 Query Hook
 * GET /api/posts/{postId}
 */
export const usePostDetail = (postId: number) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () =>
      get<PostDetail>(ENDPOINTS.POSTS.DETAIL(postId), undefined, {
        errorMessage: "게시글을 불러오는데 실패했어요.",
      }),
    staleTime: 0,
    retry: false,
  });
};
