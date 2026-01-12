import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./useToast";

/**
 * 토스트 메시지를 표시한 후 지연된 리다이렉트를 수행하는 훅
 * 글로벌 Toast를 사용합니다.
 *
 * @param delay - 리다이렉트 전 대기 시간 (밀리초, 기본값: 2500)
 * @returns 리다이렉트 함수
 *
 * @example
 * ```tsx
 * const { redirectWithToast } = useDelayedRedirectWithToast();
 *
 * // 에러 발생 시
 * redirectWithToast("로그인에 실패했습니다.", "/login");
 * ```
 */
export function useDelayedRedirectWithToast(delay: number = 2500) {
  const router = useRouter();
  const { showToast } = useToast();
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 토스트 메시지를 표시하고 지연 후 페이지 이동
   * @param message - 표시할 토스트 메시지
   * @param path - 이동할 경로
   */
  const redirectWithToast = useCallback(
    (message: string, path: string) => {
      showToast(message, delay);

      // 기존 타이머가 있으면 제거
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      // 새 타이머 설정
      timeoutIdRef.current = setTimeout(() => {
        router.push(path);
        timeoutIdRef.current = null;
      }, delay);
    },
    [router, delay, showToast]
  );

  /**
   * 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  return {
    redirectWithToast,
  };
}
