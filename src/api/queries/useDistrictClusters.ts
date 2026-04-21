import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { DistrictClusterResponse } from "@/types/api";

/**
 * 구별 가게 클러스터 조회 Query Hook
 * GET /api/shops/districts
 *
 * @param enabled - 쿼리 활성화 여부 (클러스터 모드일 때만 true)
 */
export const useDistrictClusters = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.shops.districts(),
    queryFn: async (): Promise<DistrictClusterResponse[]> => {
      const result = await get<DistrictClusterResponse[]>("/api/shops/districts", undefined, {
        errorMessage: "구별 클러스터를 불러오는데 실패했어요.",
      });

      return result ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
