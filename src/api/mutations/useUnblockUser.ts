import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { del } from "@/api/request";

/**
 * 사용자 차단 해제 Mutation Hook
 * 차단 해제 후 차단 목록 캐시를 무효화합니다.
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      del<null>(ENDPOINTS.BLOCKS.UNBLOCK(userId), {
        errorMessage: "차단 해제에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list() });
    },
  });
};
