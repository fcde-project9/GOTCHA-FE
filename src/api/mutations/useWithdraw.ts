import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { del } from "@/api/request";

interface WithdrawRequest {
  reasons: string[];
  detail?: string;
}

/**
 * 회원탈퇴 Hook
 * 회원 탈퇴 요청 후 전체 캐시를 클리어합니다.
 */
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawRequest) =>
      del<null>(ENDPOINTS.USER.WITHDRAW, data, {
        errorMessage: "회원탈퇴에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
