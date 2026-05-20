import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { ReportReasonGroup, ReportTargetType } from "@/api/types";

/**
 * 신고 사유 목록 조회 Query Hook
 * GET /api/reports/reasons
 * - targetType별로 그룹화된 사유 목록 반환
 */
export const useReportReasons = () => {
  return useQuery<ReportReasonGroup[]>({
    queryKey: queryKeys.reports.reasons(),
    queryFn: () =>
      get<ReportReasonGroup[]>(ENDPOINTS.REPORTS.REASONS, undefined, {
        errorMessage: "신고 사유 목록을 불러오지 못했어요.",
      }),
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * 특정 targetType의 신고 사유만 추출하는 헬퍼
 */
export const useReportReasonsByTarget = (targetType: ReportTargetType) => {
  const { data, ...rest } = useReportReasons();
  const group = data?.find((g) => g.targetType === targetType);
  return {
    ...rest,
    data: group?.reasons,
  };
};
