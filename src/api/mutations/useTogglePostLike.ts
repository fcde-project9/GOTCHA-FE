import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post, del } from "@/api/request";
import type { PostDetail } from "@/types/api";

/**
 * 게시글 좋아요 토글 Mutation Hook
 * POST /api/posts/{postId}/like  (좋아요)
 * DELETE /api/posts/{postId}/like (좋아요 취소)
 * 낙관적 업데이트 적용
 */
export const useTogglePostLike = (postId: number) => {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.posts.detail(postId);

  return useMutation({
    mutationFn: (isCurrentlyLiked: boolean) => {
      const url = ENDPOINTS.POSTS.LIKE(postId);
      return isCurrentlyLiked
        ? del(url, undefined, { errorMessage: "좋아요 취소에 실패했어요." })
        : post(url, undefined, { errorMessage: "좋아요에 실패했어요." });
    },
    onMutate: async (isCurrentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const prev = queryClient.getQueryData<PostDetail>(detailKey);

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !isCurrentlyLiked,
          likeCount: isCurrentlyLiked ? old.likeCount - 1 : old.likeCount + 1,
        };
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(detailKey, context.prev);
    },
  });
};
