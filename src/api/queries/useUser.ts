import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, User } from "@/api/types";

/**
 * 사용자 정보 조회 Hook
 * 로그인한 사용자의 정보를 조회합니다.
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 undefined를 반환합니다.
 */
export const useUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USER.ME);

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "사용자 정보를 불러올 수 없습니다.");
        }

        return data.data;
      } catch (error: unknown) {
        // 401 Unauthorized (비로그인 상태)는 정상적인 케이스로 처리
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          return undefined;
        }
        throw error;
      }
    },
    retry: false, // 비로그인 상태에서 재시도하지 않음
  });
};
