import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { useUpdateShopMainImage } from "./useUpdateShopMainImage";
import { useUploadFile } from "./useUploadFile";

/**
 * 가게 대표 이미지 업로드 및 업데이트 Mutation Hook (ADMIN 전용)
 * 파일 업로드와 대표 이미지 업데이트를 하나의 작업으로 처리합니다.
 */
export const useUpdateShopMainImageWithUpload = () => {
  const queryClient = useQueryClient();
  const uploadFileMutation = useUploadFile("shops");
  const updateShopMainImageMutation = useUpdateShopMainImage();

  return useMutation({
    mutationFn: async ({ shopId, file }: { shopId: number; file: File }) => {
      // 1. 파일을 GCS에 업로드
      const uploadResult = await uploadFileMutation.mutateAsync(file);

      // 2. 업로드된 URL로 대표 이미지 업데이트
      const updateResult = await updateShopMainImageMutation.mutateAsync({
        shopId,
        data: { mainImageUrl: uploadResult.fileUrl },
      });

      return updateResult;
    },
    onSuccess: (_, { shopId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
