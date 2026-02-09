import { useMutation } from "@tanstack/react-query";
import { useUpdateProfileImage } from "./useUpdateProfileImage";
import { useUploadFile } from "./useUploadFile";

/**
 * 프로필 이미지 업로드 및 업데이트 Mutation Hook
 * 파일 업로드와 프로필 이미지 업데이트를 하나의 작업으로 처리합니다.
 * 캐시 무효화는 내부 useUpdateProfileImage에서 처리됩니다.
 *
 * @returns Mutation hook - 파일을 받아 업로드 후 프로필 이미지를 업데이트
 */
export const useUpdateProfileImageWithUpload = () => {
  const uploadFileMutation = useUploadFile("profiles");
  const updateProfileImageMutation = useUpdateProfileImage();

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. 파일을 GCS에 업로드
      const uploadResult = await uploadFileMutation.mutateAsync(file);

      // 2. 업로드된 URL로 프로필 이미지 업데이트 (캐시 무효화는 useUpdateProfileImage에서 처리)
      const updateResult = await updateProfileImageMutation.mutateAsync(uploadResult.fileUrl);

      return updateResult;
    },
  });
};
