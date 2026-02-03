import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";

/**
 * 로그아웃 Hook
 * 로그아웃 요청을 처리합니다.
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () =>
      post<null>(ENDPOINTS.AUTH.LOGOUT, undefined, {
        errorMessage: "로그아웃에 실패했어요.",
      }),
  });
};
