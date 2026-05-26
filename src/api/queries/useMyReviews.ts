import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";

/** 내가 작성한 리뷰 정렬 옵션 */
export type MyReviewsSort = "LATEST" | "LIKE_COUNT";

/** 내가 작성한 리뷰 응답 타입 */
export interface MyReviewResponse {
  id: number;
  shopId: number;
  shopName: string;
  content: string;
  imageUrls: string[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

/** 페이징 응답 타입 */
interface MyReviewsPageResponse {
  content: MyReviewResponse[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

/**
 * 내가 작성한 리뷰 목록 조회 Query Hook
 * GET /api/users/me/reviews?sortBy=LATEST|LIKE_COUNT
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 */
export const useMyReviews = (sortBy: MyReviewsSort = "LATEST") => {
  return useQuery<MyReviewsPageResponse | null>({
    queryKey: queryKeys.user.myReviews(sortBy),
    queryFn: () =>
      get<MyReviewsPageResponse | null>(
        ENDPOINTS.USER.MY_REVIEWS,
        { sortBy },
        {
          errorMessage: "작성한 리뷰 목록을 불러오는데 실패했어요.",
          allowUnauthorized: true,
        }
      ),
    retry: false,
  });
};
