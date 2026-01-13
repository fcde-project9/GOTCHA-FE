import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, User } from "@/api/types";

/**
 * 사용자 정보 조회 Hook
 * 로그인한 사용자의 정보를 조회합니다.
 * 토큰이 없으면 API 호출을 하지 않습니다.
 */
export const useUser = () => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    try {
      setHasToken(!!localStorage.getItem("accessToken"));
    } catch {
      setHasToken(false);
    }
  }, []);

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USER.ME);

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || "사용자 정보를 불러올 수 없습니다.");
      }

      return data.data;
    },
    enabled: hasToken,
    retry: 1,
  });
};
