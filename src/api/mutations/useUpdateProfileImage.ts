import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, User } from "@/api/types";
import { extractApiError } from "@/api/types";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

interface UpdateProfileImageRequest {
  profileImageUrl: string;
}

/**
 * 프로필 이미지 변경 Mutation Hook
 * 프로필 이미지 변경 후 사용자 정보 쿼리를 무효화하여 자동으로 최신 데이터를 불러옵니다.
 */
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileImageUrl: string) => {
      try {
        const { data } = await apiClient.patch<ApiResponse<User>>(
          ENDPOINTS.USER.UPDATE_PROFILE_IMAGE,
          { profileImageUrl } as UpdateProfileImageRequest
        );

        // API 응답 검증
        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "프로필 이미지 변경에 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "프로필 이미지 변경에 실패했습니다.");
      }
    },
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화하여 최신 데이터 불러오기
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
