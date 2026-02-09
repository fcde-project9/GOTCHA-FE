import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";

/** 내가 제보한 가게 응답 타입 */
export interface MyReportedShopResponse {
  id: number;
  name: string;
  mainImageUrl: string | null;
  addressName: string;
  openStatus: string; // "영업 중", "영업 종료", "휴무", ""
  createdAt: string; // YYYY-MM-DD
}

/** 페이징 응답 타입 */
interface MyReportsPageResponse {
  content: MyReportedShopResponse[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

/**
 * 내가 제보한 가게 목록 조회 Query Hook
 * GET /api/users/me/shops
 * 비로그인 상태(401 에러)에서는 에러를 던지지 않고 null을 반환합니다.
 */
export const useMyReports = () => {
  return useQuery<MyReportsPageResponse | null>({
    queryKey: queryKeys.user.myReports(),
    queryFn: () =>
      get<MyReportsPageResponse | null>(ENDPOINTS.USER.MY_SHOPS, undefined, {
        errorMessage: "제보한 업체 목록을 불러오는데 실패했어요.",
        allowUnauthorized: true,
      }),
    retry: false,
  });
};
