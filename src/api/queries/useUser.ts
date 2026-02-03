import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { User } from "@/api/types";
import { useAuth } from "@/hooks";

/**
 * 사용자 정보 조회 Hook
 * 로그인한 사용자의 정보를 조회합니다.
 * useAuth의 isLoggedIn 상태를 기반으로 API 호출 여부를 결정합니다.
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 undefined를 반환합니다.
 */
export const useUser = () => {
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();

  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      const result = await get<User>(ENDPOINTS.USER.ME, undefined, {
        errorMessage: "사용자 정보를 불러올 수 없어요.",
        allowUnauthorized: true,
      });

      // 401 에러로 null 반환 시 로그아웃 처리
      if (result === null) {
        logout();
        return undefined;
      }

      return result;
    },
    enabled: !authLoading && isLoggedIn,
    retry: false,
  });
};
