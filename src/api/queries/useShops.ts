import { useQuery } from "@tanstack/react-query";
import type { Shop } from "@/types/shop";
import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

// 매장 리스트 조회
export const useShops = () => {
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data } = await apiClient.get<Shop[]>(ENDPOINTS.SHOPS.LIST);
      return data;
    },
  });
};

// 매장 상세 조회
export const useShop = (id: string) => {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Shop>(ENDPOINTS.SHOPS.DETAIL(id));
      return data;
    },
    enabled: !!id, // id가 있을 때만 실행
  });
};
