import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateProfileImage } from "./useUpdateProfileImage";
import { useUploadFile } from "./useUploadFile";

/**
 * 프로필 이미지 업로드 및 업데이트 Mutation Hook
 * 파일 업로드와 프로필 이미지 업데이트를 하나의 작업으로 처리합니다.
 *
 * @returns Mutation hook - 파일을 받아 업로드 후 프로필 이미지를 업데이트
 */
export const useUpdateProfileImageWithUpload = () => {
  const queryClient = useQueryClient();
  const uploadFileMutation = useUploadFile("profiles");
  const updateProfileImageMutation = useUpdateProfileImage();

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. 파일을 GCS에 업로드
      const uploadResult = await uploadFileMutation.mutateAsync(file);

      // 2. 업로드된 URL로 프로필 이미지 업데이트
      const updateResult = await updateProfileImageMutation.mutateAsync(uploadResult.fileUrl);

      return updateResult;
    },
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화하여 최신 데이터 불러오기
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
