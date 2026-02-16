import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post } from "@/api/request";
import type { BlockResponse } from "@/api/types";

/**
 * 사용자 차단 Mutation Hook
 * POST /api/users/{userId}/block
 * 차단 성공 시 리뷰 목록과 차단 목록 캐시를 무효화합니다.
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      post<BlockResponse>(ENDPOINTS.BLOCKS.BLOCK(userId), undefined, {
        errorMessage: "사용자 차단에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list() });
    },
  });
};
