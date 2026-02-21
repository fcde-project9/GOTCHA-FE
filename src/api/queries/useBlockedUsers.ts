import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { BlockedUsersPageResponse } from "@/types/api";

/**
 * 차단한 사용자 목록 조회 Query Hook
 * GET /api/users/me/blocks
 */
export const useBlockedUsers = () => {
  return useQuery<BlockedUsersPageResponse | null>({
    queryKey: queryKeys.blocks.list(),
    queryFn: () =>
      get<BlockedUsersPageResponse | null>(ENDPOINTS.BLOCKS.LIST, undefined, {
        errorMessage: "차단 목록을 불러오는데 실패했어요.",
        allowUnauthorized: true,
      }),
    retry: false,
  });
};
