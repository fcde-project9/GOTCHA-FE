import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";

/**
 * 로그아웃 Hook
 * 로그아웃 요청을 처리합니다.
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "로그아웃에 실패했습니다.");
      }

      return response.data;
    },
  });
};
