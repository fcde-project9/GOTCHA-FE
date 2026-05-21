import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { del } from "@/api/request";

/**
 * 댓글/대댓글 삭제 Mutation Hook
 * DELETE /api/posts/{postId}/comments/{commentId}
 */
export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) =>
      del(ENDPOINTS.POSTS.DELETE_COMMENT(postId, commentId), {
        errorMessage: "댓글 삭제에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
};
