import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post } from "@/api/request";

interface CreateCommentRequest {
  parentId: number | null;
  content: string;
  isAnonymous: boolean;
}

/**
 * 댓글/대댓글 작성 Mutation Hook
 * POST /api/posts/{postId}/comments
 * - parentId 없으면 댓글, 있으면 대댓글
 */
export const useCreateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      post(ENDPOINTS.POSTS.COMMENTS(postId), data, {
        errorMessage: "댓글 등록에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
};
