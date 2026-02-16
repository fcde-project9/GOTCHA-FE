import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { CreateReportRequest, ReportResponse } from "@/api/types";

/**
 * 리뷰/가게/유저 신고 Mutation Hook
 * POST /api/reports
 */
export const useCreateReport = () => {
  return useMutation({
    mutationFn: (data: CreateReportRequest) =>
      post<ReportResponse>(ENDPOINTS.REPORTS.CREATE, data, {
        errorMessage: "신고 접수에 실패했어요.",
      }),
  });
};
