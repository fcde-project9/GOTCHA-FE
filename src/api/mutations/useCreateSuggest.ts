import { useMutation } from "@tanstack/react-query";
import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { CreateShopSuggestRequest } from "@/api/types";

/**
 * 가게 정보 수정 제안 Mutation Hook
 * POST /api/shops/{shopId}/suggest
 */
export const useCreateSuggest = () => {
  return useMutation({
    mutationFn: ({ shopId, data }: { shopId: number; data: CreateShopSuggestRequest }) =>
      post<void>(ENDPOINTS.SUGGESTS.CREATE(shopId), data, {
        errorMessage: "제안 접수에 실패했어요.",
      }),
  });
};
