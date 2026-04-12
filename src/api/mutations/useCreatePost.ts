import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post } from "@/api/request";

interface CreatePostRequest {
  typeId: number;
  title: string;
  content: string;
  imageUrls: string[];
}

/**
 * 커뮤니티 게시글 작성 Mutation Hook
 * POST /api/posts
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) =>
      post(ENDPOINTS.POSTS.CREATE, data, {
        errorMessage: "게시글 등록에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
