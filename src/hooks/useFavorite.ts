"use client";

import { useState, useCallback, useEffect } from "react";
import { useAddFavorite, useRemoveFavorite } from "@/api/mutations/useToggleFavorite";

interface UseFavoriteOptions {
  shopId: number;
  initialIsFavorite?: boolean;
  onSuccess?: (isFavorite: boolean) => void;
  onError?: (error: Error) => void;
}

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  toggleFavorite: () => void;
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

  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  // initialIsFavorite 변경 시 상태 동기화 (API 응답 후 shop 데이터가 로드되었을 때)
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = useCallback(() => {
    if (isLoading) return;

    const previousState = isFavorite;
    // Optimistic update
    setIsFavorite(!previousState);

    const mutation = previousState ? removeFavoriteMutation : addFavoriteMutation;

    mutation.mutate(shopId, {
      onSuccess: (data) => {
        setIsFavorite(data.isFavorite);
        onSuccess?.(data.isFavorite);
      },
      onError: (error) => {
        // 에러 시 롤백
        setIsFavorite(previousState);
        onError?.(error instanceof Error ? error : new Error("찜하기에 실패했습니다."));
      },
    });
  }, [
    shopId,
    isFavorite,
    isLoading,
    addFavoriteMutation,
    removeFavoriteMutation,
    onSuccess,
    onError,
  ]);

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
  };
}
