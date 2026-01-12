import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, User } from "@/api/types";

/**
 * 사용자 정보 조회 Hook
 * 로그인한 사용자의 정보를 조회합니다.
 */
export const useUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USER.ME);

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || "사용자 정보를 불러올 수 없습니다.");
      }

      return data.data;
    },
    retry: 1,
  });
};
