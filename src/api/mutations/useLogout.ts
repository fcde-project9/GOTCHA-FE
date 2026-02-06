import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";

/**
 * 로그아웃 Hook
 * 로그아웃 요청 후 전체 캐시를 클리어합니다.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      post<null>(ENDPOINTS.AUTH.LOGOUT, undefined, {
        errorMessage: "로그아웃에 실패했어요.",
      }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
