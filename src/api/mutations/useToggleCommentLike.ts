import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post, del } from "@/api/request";
import type { PostDetail } from "@/types/api";

/**
 * 댓글/대댓글 좋아요 토글 Mutation Hook
 * POST /api/posts/{postId}/comments/{commentId}/like  (좋아요)
 * DELETE /api/posts/{postId}/comments/{commentId}/like (좋아요 취소)
 * 낙관적 업데이트 적용
 */
export const useToggleCommentLike = (postId: number) => {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.posts.detail(postId);

  return useMutation({
    mutationFn: ({
      commentId,
      isCurrentlyLiked,
    }: {
      commentId: number;
      isCurrentlyLiked: boolean;
    }) => {
      const url = ENDPOINTS.POSTS.COMMENT_LIKE(postId, commentId);
      return isCurrentlyLiked
        ? del(url, undefined, { errorMessage: "좋아요 취소에 실패했어요." })
        : post(url, undefined, { errorMessage: "좋아요에 실패했어요." });
    },
    onMutate: async ({ commentId, isCurrentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const prev = queryClient.getQueryData<PostDetail>(detailKey);

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) => {
            // 댓글 본체
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !isCurrentlyLiked,
                likeCount: isCurrentlyLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              };
            }
            // 대댓글
            const updatedReplies = comment.replies?.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !isCurrentlyLiked,
                    likeCount: isCurrentlyLiked ? reply.likeCount - 1 : reply.likeCount + 1,
                  }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          }),
        };
      });

      return { prev };
    },
    onError: (_err, { commentId }, context) => {
      if (!context?.prev) return;

      // Find original values for the affected comment/reply from snapshot
      let origIsLiked: boolean | undefined;
      let origLikeCount: number | undefined;
      for (const c of context.prev.comments) {
        if (c.id === commentId) {
          origIsLiked = c.isLiked;
          origLikeCount = c.likeCount;
          break;
        }
        const reply = c.replies?.find((r) => r.id === commentId);
        if (reply) {
          origIsLiked = reply.isLiked;
          origLikeCount = reply.likeCount;
          break;
        }
      }
      if (origIsLiked === undefined) return;

      // Selectively revert only the affected comment/reply
      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, isLiked: origIsLiked!, likeCount: origLikeCount! };
            }
            const updatedReplies = comment.replies?.map((reply) =>
              reply.id === commentId
                ? { ...reply, isLiked: origIsLiked!, likeCount: origLikeCount! }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          }),
        };
      });
    },
  });
};
