"use client";

import { useState, useCallback, useEffect, useOptimistic, startTransition } from "react";
import { useAddFavorite, useRemoveFavorite } from "@/api/mutations/useToggleFavorite";
import { trackFavoriteToggle } from "@/utils/analytics";
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
  // 실제 상태 (API/props에서 동기화)
  const [actualFavorite, setActualFavorite] = useState(initialIsFavorite);

  // React 19 useOptimistic: 낙관적 상태 자동 관리
  // - 즉시 UI 업데이트
  // - 트랜지션 종료 시 actualFavorite으로 자동 동기화 (에러 시 자동 롤백)
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(actualFavorite);

  const { isLoggedIn } = useAuth();

  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  // initialIsFavorite 변경 시 상태 동기화 (API 응답 후 shop 데이터가 로드되었을 때)
  useEffect(() => {
    setActualFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = useCallback(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      onUnauthorized?.();
      return;
    }

    const newValue = !actualFavorite;
    const mutation = actualFavorite ? removeFavoriteMutation : addFavoriteMutation;

    // startTransition 내에서 useOptimistic 사용
    // 트랜지션 완료 시 optimistic 상태가 actual 상태로 자동 동기화됨
    startTransition(async () => {
      setOptimisticFavorite(newValue);

      try {
        const data = await mutation.mutateAsync(shopId);
        setActualFavorite(data.isFavorite);

        // GA 이벤트: 찜하기/해제
        trackFavoriteToggle(shopId, data.isFavorite);

        onSuccess?.(data.isFavorite);
      } catch (error) {
        // 에러 시 트랜지션 종료 → optimistic 상태가 actualFavorite으로 자동 롤백
        onError?.(error instanceof Error ? error : new Error("찜하기에 실패했어요."));
      }
    });
  }, [
    shopId,
    actualFavorite,
    isLoading,
    isLoggedIn,
    addFavoriteMutation,
    removeFavoriteMutation,
    setOptimisticFavorite,
    onSuccess,
    onError,
    onUnauthorized,
  ]);

  return {
    isFavorite: optimisticFavorite,
    isLoading,
    toggleFavorite,
  };
}
