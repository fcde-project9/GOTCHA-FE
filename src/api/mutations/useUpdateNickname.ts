import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { patch } from "@/api/request";
import type { User } from "@/api/types";

/**
 * 닉네임 변경 Mutation Hook
 * 닉네임 변경 후 사용자 정보 쿼리를 무효화하여 자동으로 최신 데이터를 불러옵니다.
 */
export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) =>
      patch<User>(
        ENDPOINTS.USER.UPDATE_NICKNAME,
        { nickname },
        {
          errorMessage: "닉네임 변경에 실패했어요.",
        }
      ),
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화하여 최신 데이터 불러오기
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
};
