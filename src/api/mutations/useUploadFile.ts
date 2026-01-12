import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse, FileUploadResponse } from "@/api/types";
import { extractApiError } from "@/api/types";

/**
 * 파일 업로드 Mutation Hook
 * Google Cloud Storage에 이미지를 업로드합니다.
 * @param folder - 저장할 폴더명 (예: "profiles", "shops", "reviews")
 */
export const useUploadFile = (folder: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        // Content-Type 헤더 제거 - axios가 FormData boundary를 자동 설정
        const { data } = await apiClient.post<ApiResponse<FileUploadResponse>>(
          ENDPOINTS.FILE.UPLOAD,
          formData
        );

        // success 플래그 검증
        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "파일 업로드에 실패했습니다.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
  });
};
