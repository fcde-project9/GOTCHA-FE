"use client";

import { useState, useCallback, useEffect } from "react";
import { useAddFavorite, useRemoveFavorite } from "@/api/mutations/useToggleFavorite";
import { useAuth } from "./useAuth";

interface UseFavoriteOptions {
  shopId: number;
  initialIsFavorite?: boolean;
  onSuccess?: (isFavorite: boolean) => void;
  onError?: (error: Error) => void;
  onUnauthorized?: () => void; // 비로그인 시 콜백
}

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  toggleFavorite: () => void;
}

/**
 * 찜하기 기능을 위한 공통 훅
 * 로그인 체크를 포함하여 비로그인 사용자는 onUnauthorized 콜백을 호출합니다.
 * useAuth를 사용하여 전역 로그인 상태를 확인합니다.
 *
 * @param options - 훅 옵션
 * @param options.shopId - 가게 ID
 * @param options.initialIsFavorite - 초기 찜 상태 (기본값: false)
 * @param options.onSuccess - 성공 시 콜백
 * @param options.onError - 실패 시 콜백
 * @param options.onUnauthorized - 비로그인 시 콜백 (토스트 메시지 표시 등)
 * @returns 찜 상태와 토글 함수
 *
 * @example
 * ```tsx
 * const { isFavorite, isLoading, toggleFavorite } = useFavorite({
 *   shopId: 1,
 *   initialIsFavorite: shop.isFavorite,
 *   onUnauthorized: () => {
 *     setToastMessage("찜하기는 로그인 후 이용 가능합니다");
 *     setShowToast(true);
 *   },
 * });
 * ```
 */
export function useFavorite({
  shopId,
  initialIsFavorite = false,
  onSuccess,
  onError,
  onUnauthorized,
}: UseFavoriteOptions): UseFavoriteReturn {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // 전역 로그인 상태 확인
  const { isLoggedIn } = useAuth();

  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  // initialIsFavorite 변경 시 상태 동기화 (API 응답 후 shop 데이터가 로드되었을 때)
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = useCallback(() => {
    if (isLoading) return;

    // 로그인 체크
    if (!isLoggedIn) {
      onUnauthorized?.();
      return;
    }

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
        onError?.(error instanceof Error ? error : new Error("찜하기에 실패했어요."));
      },
    });
  }, [
    shopId,
    isFavorite,
    isLoading,
    isLoggedIn,
    addFavoriteMutation,
    removeFavoriteMutation,
    onSuccess,
    onError,
    onUnauthorized,
  ]);

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
  };
}
