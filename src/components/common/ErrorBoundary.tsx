"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary 컴포넌트
 *
 * 자식 컴포넌트 트리에서 발생하는 JavaScript 에러를 잡아
 * fallback UI를 표시합니다.
 *
 * @example
 * // 기본 사용
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // 함수형 fallback (에러 정보 + reset 제공)
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>에러: {error.message}</p>
 *       <button onClick={reset}>다시 시도</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 에러 로깅 (예: Sentry, LogRocket 등)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      // 함수형 fallback인 경우
      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }

      // ReactNode fallback인 경우
      if (fallback) {
        return fallback;
      }

      // 기본 fallback
      return <DefaultErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

/**
 * 기본 에러 Fallback UI
 */
export function DefaultErrorFallback({
  error,
  onRetry,
  title = "문제가 발생했어요",
  description = "잠시 후 다시 시도해주세요.",
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <div className="mb-4 text-4xl">😢</div>
      <h2 className="text-lg font-semibold text-grey-900 mb-2">{title}</h2>
      <p className="text-sm text-grey-500 mb-4">{description}</p>
      {error && process.env.NODE_ENV === "development" && (
        <pre className="text-xs text-red-500 bg-red-50 p-2 rounded mb-4 max-w-full overflow-auto">
          {error.message}
        </pre>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

/**
 * 인라인 에러 Fallback (작은 섹션용)
 */
export function InlineErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-red-500">⚠️</span>
        <span className="text-sm text-red-700">
          {error?.message || "데이터를 불러오는데 실패했어요."}
        </span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-red-600 font-medium hover:text-red-700">
          재시도
        </button>
      )}
    </div>
  );
}
