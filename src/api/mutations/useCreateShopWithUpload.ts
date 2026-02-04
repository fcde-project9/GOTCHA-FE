import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import type { CreateShopRequest, CoordinateRequest } from "@/api/types";
import { useCreateShop } from "./useCreateShop";
import { useUploadFile } from "./useUploadFile";

interface CreateShopWithUploadParams {
  file: File;
  shopData: Omit<CreateShopRequest, "mainImageUrl">;
  coordinate: CoordinateRequest;
}

/**
 * 가게 이미지 업로드 및 생성 Mutation Hook
 * 파일 업로드와 가게 생성을 하나의 작업으로 처리합니다.
 *
 * @returns Mutation hook - 파일과 가게 정보를 받아 업로드 후 가게를 생성
 */
export const useCreateShopWithUpload = () => {
  const queryClient = useQueryClient();
  const uploadFileMutation = useUploadFile("shops");
  const createShopMutation = useCreateShop();

  return useMutation({
    mutationFn: async ({ file, shopData, coordinate }: CreateShopWithUploadParams) => {
      // 1. 파일을 GCS에 업로드
      const uploadResult = await uploadFileMutation.mutateAsync(file);

      // 2. 업로드된 URL로 가게 생성
      const shopResult = await createShopMutation.mutateAsync({
        shopData: {
          ...shopData,
          mainImageUrl: uploadResult.fileUrl,
        },
        coordinate,
      });

      return shopResult;
    },
    onSuccess: () => {
      // 제보 완료 시 내가 제보한 업체 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user.myReports() });
    },
  });
};
