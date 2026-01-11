import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, FileUploadResponse } from "@/api/types";
import { extractApiError } from "@/api/types";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

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

        const { data } = await apiClient.post<ApiResponse<FileUploadResponse>>(
          ENDPOINTS.FILE.UPLOAD,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return data.data!;
      } catch (error) {
        const apiError = extractApiError(error);
        throw new Error(apiError?.message || "파일 업로드에 실패했습니다.");
      }
    },
  });
};
