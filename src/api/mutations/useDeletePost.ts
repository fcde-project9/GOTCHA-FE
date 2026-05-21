import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { del } from "@/api/request";

/**
 * 게시글 삭제 Mutation Hook
 * DELETE /api/posts/{postId}
 */
export const useDeletePost = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      del(ENDPOINTS.POSTS.DELETE(postId), { errorMessage: "게시글 삭제에 실패했어요." }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
