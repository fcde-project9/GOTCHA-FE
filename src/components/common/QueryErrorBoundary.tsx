"use client";

import { type ReactNode } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, DefaultErrorFallback } from "./ErrorBoundary";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error) => void;
}

/**
 * React Query 에러 경계 컴포넌트
 *
 * React Query의 useQueryErrorResetBoundary와 통합되어
 * 에러 복구 시 쿼리도 함께 리셋됩니다.
 *
 * @example
 * // 기본 사용
 * <QueryErrorBoundary>
 *   <MyQueryComponent />
 * </QueryErrorBoundary>
 *
 * // 커스텀 fallback
 * <QueryErrorBoundary
 *   fallback={(error, reset) => (
 *     <ErrorCard error={error} onRetry={reset} />
 *   )}
 * >
 *   <MyQueryComponent />
 * </QueryErrorBoundary>
 */
export function QueryErrorBoundary({ children, fallback, onError }: QueryErrorBoundaryProps) {
  const { reset: resetQueries } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(error, resetBoundary) => {
        const handleReset = () => {
          resetQueries(); // React Query 캐시 리셋
          resetBoundary(); // Error Boundary 리셋
        };

        if (typeof fallback === "function") {
          return fallback(error, handleReset);
        }

        if (fallback) {
          return fallback;
        }

        return <DefaultErrorFallback error={error} onRetry={handleReset} />;
      }}
      onError={(error) => onError?.(error)}
    >
      {children}
    </ErrorBoundary>
  );
}

interface QueryErrorFallbackProps {
  title?: string;
  description?: string;
}

/**
 * Query 에러용 페이지 전체 Fallback
 */
export function QueryPageErrorFallback({
  title = "페이지를 불러올 수 없어요",
  description = "네트워크 연결을 확인하고 다시 시도해주세요.",
}: QueryErrorFallbackProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="mb-4 text-5xl">📡</div>
      <h2 className="text-lg font-semibold text-grey-900 mb-2">{title}</h2>
      <p className="text-sm text-grey-500 mb-6">{description}</p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

/**
 * Query 에러용 섹션 Fallback
 */
export function QuerySectionErrorFallback({
  title = "데이터를 불러올 수 없어요",
  description = "잠시 후 다시 시도해주세요.",
}: QueryErrorFallbackProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-grey-50 rounded-lg">
      <p className="text-sm text-grey-600 mb-3">{title}</p>
      <button
        type="button"
        onClick={reset}
        className="text-sm text-primary-500 font-medium hover:text-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
}
