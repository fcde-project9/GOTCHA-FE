"use client";

import { useState, useCallback } from "react";
import { addShopFavorite, removeShopFavorite } from "@/api/queries/favoriteApi";

interface UseFavoriteOptions {
  shopId: number;
  initialIsFavorite?: boolean;
  onSuccess?: (isFavorite: boolean) => void;
  onError?: (error: Error) => void;
}

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  toggleFavorite: () => Promise<void>;
}

/**
 * 찜하기 기능을 위한 공통 훅
 *
 * @param options - 훅 옵션
 * @param options.shopId - 가게 ID
 * @param options.initialIsFavorite - 초기 찜 상태 (기본값: false)
 * @param options.onSuccess - 성공 시 콜백
 * @param options.onError - 실패 시 콜백
 * @returns 찜 상태와 토글 함수
 *
 * @example
 * ```tsx
 * const { isFavorite, isLoading, toggleFavorite } = useFavorite({
 *   shopId: 1,
 *   initialIsFavorite: shop.isFavorite,
 *   onError: (error) => toast.error(error.message),
 * });
 * ```
 */
export function useFavorite({
  shopId,
  initialIsFavorite = false,
  onSuccess,
  onError,
}: UseFavoriteOptions): UseFavoriteReturn {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(async () => {
    if (isLoading) return;

    const previousState = isFavorite;
    // Optimistic update
    setIsFavorite(!previousState);
    setIsLoading(true);

    try {
      const response = previousState
        ? await removeShopFavorite(shopId)
        : await addShopFavorite(shopId);

      if (response.success) {
        setIsFavorite(response.data.isFavorite);
        onSuccess?.(response.data.isFavorite);
      } else {
        // 실패 시 롤백
        setIsFavorite(previousState);
        // 호출자에게 실패 알림
        onError?.(new Error("찜하기 업데이트에 실패했습니다."));
      }
    } catch (error) {
      // 에러 시 롤백
      setIsFavorite(previousState);
      const errorMessage = error instanceof Error ? error : new Error("찜하기에 실패했습니다.");
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, isFavorite, isLoading, onSuccess, onError]);

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
  };
}
