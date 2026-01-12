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
      let imageUrls: string[] = [];

      if (images.length > 0) {
        // 순서 보존을 위해 원본 길이만큼 배열 할당
        const uploadedUrls: (string | null)[] = new Array(images.length).fill(null);
        let completedCount = 0;

        const uploadPromises = images.map((file, originalIndex) =>
          uploadFileMutation.mutateAsync(file).then((result) => {
            // 원본 순서 유지하며 URL 저장
            uploadedUrls[originalIndex] = result.fileUrl;
            // 완료된 개수 증가 후 진행률 업데이트
            completedCount += 1;
            onUploadProgress?.({ uploaded: completedCount, total: images.length });
            return result;
          })
        );

        await Promise.allSettled(uploadPromises);

        // 성공한 업로드만 필터링 (순서 유지)
        imageUrls = uploadedUrls.filter((url): url is string => url !== null);
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
