import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, User } from "@/api/types";
import { extractApiError } from "@/api/types";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

interface UpdateNicknameRequest {
  nickname: string;
}

/**
 * 닉네임 변경 Mutation Hook
 * 닉네임 변경 후 사용자 정보 쿼리를 무효화하여 자동으로 최신 데이터를 불러옵니다.
 */
export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nickname: string) => {
      try {
        const { data } = await apiClient.patch<ApiResponse<User>>(ENDPOINTS.USER.UPDATE_NICKNAME, {
          nickname,
        } as UpdateNicknameRequest);

        // API 응답 검증
        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "닉네임 변경에 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        // 백엔드 에러 메시지 추출 (U001: 닉네임 중복, U002: 닉네임 형식 오류 등)
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "닉네임 변경에 실패했습니다.");
      }
    },
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화하여 최신 데이터 불러오기
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
