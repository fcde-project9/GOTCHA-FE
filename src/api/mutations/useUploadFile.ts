import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { FileUploadResponse } from "@/api/types";

/**
 * 파일 업로드 Mutation Hook
 * Google Cloud Storage에 이미지를 업로드합니다.
 * @param folder - 저장할 폴더명 (예: "profiles", "shops", "reviews")
 */
export const useUploadFile = (folder: string) => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      // folder는 query parameter로 전달
      // Content-Type을 undefined로 설정하여 axios가 multipart/form-data + boundary를 자동 설정하도록 함
      return post<FileUploadResponse>(ENDPOINTS.FILE.UPLOAD, formData, {
        errorMessage: "업로드에 실패했어요.",
        params: { folder },
        headers: { "Content-Type": undefined },
      });
    },
  });
};
