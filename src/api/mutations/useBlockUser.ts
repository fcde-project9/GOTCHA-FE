import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { post } from "@/api/request";

interface BlockUserResponse {
  blockedUserId: number;
  blockedAt: string;
}

/**
 * 사용자 차단 Mutation Hook
 * 차단 후 차단 목록 캐시를 무효화합니다.
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      post<BlockUserResponse>(ENDPOINTS.BLOCKS.BLOCK(userId), undefined, {
        errorMessage: "차단에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list() });
    },
  });
};
