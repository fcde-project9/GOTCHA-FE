import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";

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
    mutationFn: async (data: WithdrawRequest) => {
      const response = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.USER.WITHDRAW, {
        data,
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "회원탈퇴에 실패했어요.");
      }

      return response.data;
    },
  });
};
