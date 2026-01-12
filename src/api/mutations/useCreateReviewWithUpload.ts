import { useMutation } from "@tanstack/react-query";
import { useCreateReview } from "./useCreateReview";
import { useUploadFile } from "./useUploadFile";

interface CreateReviewWithUploadRequest {
  content: string;
  images: File[];
}

interface UploadProgress {
  uploaded: number;
  total: number;
}

/**
 * 리뷰 작성 (이미지 업로드 포함) Mutation Hook
 * 이미지 업로드와 리뷰 작성을 하나의 작업으로 처리합니다.
 *
 * @param shopId - 가게 ID
 * @param onUploadProgress - 업로드 진행률 콜백 (optional)
 * @returns Mutation hook - 파일들과 내용을 받아 업로드 후 리뷰를 작성
 */
export const useCreateReviewWithUpload = (
  shopId: number,
  onUploadProgress?: (progress: UploadProgress) => void
) => {
  const uploadFileMutation = useUploadFile("reviews");
  const createReviewMutation = useCreateReview(shopId);

  return useMutation({
    mutationFn: async ({ content, images }: CreateReviewWithUploadRequest) => {
      // 1. 이미지들을 GCS에 업로드 (Promise.allSettled로 개별 실패 처리)
      const imageUrls: string[] = [];

      if (images.length > 0) {
        const uploadPromises = images.map((file, index) =>
          uploadFileMutation.mutateAsync(file).then((result) => {
            // 진행률 업데이트
            onUploadProgress?.({ uploaded: index + 1, total: images.length });
            return result;
          })
        );

        const results = await Promise.allSettled(uploadPromises);

        // 성공한 업로드만 URL 추출
        for (const result of results) {
          if (result.status === "fulfilled") {
            imageUrls.push(result.value.fileUrl);
          }
        }
      }

      // 2. 리뷰 작성
      const review = await createReviewMutation.mutateAsync({
        content,
        imageUrls,
      });

      return review;
    },
  });
};
