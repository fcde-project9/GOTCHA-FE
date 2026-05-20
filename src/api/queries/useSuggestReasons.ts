import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { ShopSuggestReasonItem } from "@/api/types";

/**
 * 매장 정보 수정 제안 사유 목록 조회 Query Hook
 * GET /api/shops/suggest-reasons
 */
export const useSuggestReasons = () => {
  return useQuery<ShopSuggestReasonItem[]>({
    queryKey: queryKeys.suggests.reasons(),
    queryFn: () =>
      get<ShopSuggestReasonItem[]>(ENDPOINTS.SUGGESTS.REASONS, undefined, {
        errorMessage: "제안 사유 목록을 불러오지 못했어요.",
      }),
    staleTime: 1000 * 60 * 60, // 거의 변하지 않는 정적 데이터 → 1시간 캐싱
  });
};
