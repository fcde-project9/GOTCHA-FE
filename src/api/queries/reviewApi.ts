import apiClient from "@/api/client";
import {
  FileUploadApiResponse,
  ImageUploadFolder,
  CreateReviewRequest,
  CreateReviewApiResponse,
  ShopReviewsApiResponse,
  ReviewSortOption,
} from "@/types/api";

/**
 * 이미지 파일 업로드
 * POST /api/files/upload?folder={folder}
 *
 * @param file - 업로드할 파일
 * @param folder - 저장할 폴더 (reviews, shops, profiles)
 * @returns 업로드된 파일 정보
 */
export async function uploadImage(
  file: File,
  folder: ImageUploadFolder = "reviews"
): Promise<FileUploadApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<FileUploadApiResponse>(
    `/api/files/upload?folder=${folder}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

/**
 * 여러 이미지 파일 업로드
 *
 * @param files - 업로드할 파일 배열
 * @param folder - 저장할 폴더
 * @returns 업로드된 파일 URL 배열
 */
export async function uploadImages(
  files: File[],
  folder: ImageUploadFolder = "reviews"
): Promise<string[]> {
  if (files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadImage(file, folder));
  const results = await Promise.all(uploadPromises);

  return results.filter((result) => result.success).map((result) => result.data.fileUrl);
}

/**
 * 리뷰 작성
 * POST /api/shops/{shopId}/reviews
 *
 * @param shopId - 가게 ID
 * @param request - 리뷰 작성 요청 (content, imageUrls)
 * @returns 생성된 리뷰 정보
 */
export async function createReview(
  shopId: number,
  request: CreateReviewRequest
): Promise<CreateReviewApiResponse> {
  const { data } = await apiClient.post<CreateReviewApiResponse>(
    `/api/shops/${shopId}/reviews`,
    request
  );

  return data;
}

/**
 * 리뷰 목록 조회
 * GET /api/shops/{shopId}/reviews
 *
 * @param shopId - 가게 ID
 * @param sortBy - 정렬 옵션 (LATEST, LIKE_COUNT)
 * @param page - 페이지 번호 (0부터 시작)
 * @param size - 페이지 크기
 * @returns 리뷰 목록
 */
export async function fetchReviews(
  shopId: number,
  sortBy: ReviewSortOption = "LATEST",
  page: number = 0,
  size: number = 10
): Promise<ShopReviewsApiResponse> {
  const { data } = await apiClient.get<ShopReviewsApiResponse>(`/api/shops/${shopId}/reviews`, {
    params: { sortBy, page, size },
  });

  return data;
}
