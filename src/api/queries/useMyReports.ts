import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/api/types";
import { extractApiError } from "@/api/types";

/** 내가 제보한 가게 응답 타입 */
export interface MyReportedShopResponse {
  id: number;
  name: string;
  mainImageUrl: string | null;
  addressName: string;
  isOpen: boolean;
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
  return useQuery({
    queryKey: ["myReports"],
    queryFn: async (): Promise<MyReportsPageResponse | null> => {
      try {
        const { data } = await apiClient.get<ApiResponse<MyReportsPageResponse>>(
          ENDPOINTS.USER.MY_SHOPS
        );

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "제보한 업체 목록을 불러오는데 실패했어요.");
        }

        return data.data;
      } catch (error: unknown) {
        // 401 Unauthorized (비로그인 상태)는 정상적인 케이스로 처리
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          return null;
        }

        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
    retry: false, // 비로그인 상태에서 재시도하지 않음
  });
};
