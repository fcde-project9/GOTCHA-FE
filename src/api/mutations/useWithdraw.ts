import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { del } from "@/api/request";

interface WithdrawRequest {
  reasons: string[];
  detail?: string;
}

/**
 * 회원탈퇴 Hook
 * 회원 탈퇴 요청을 처리합니다.
 */
export const useWithdraw = () => {
  return useMutation({
    mutationFn: (data: WithdrawRequest) =>
      del<null>(ENDPOINTS.USER.WITHDRAW, data, {
        errorMessage: "회원탈퇴에 실패했어요.",
      }),
  });
};
