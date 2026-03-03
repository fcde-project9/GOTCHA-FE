"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Toast } from "@/components/common";
import type { ToastVariant, ToastAction } from "@/components/common/Toast";

interface ShowToastOptions {
  duration?: number;
  action?: ToastAction;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (
    message: string,
    durationOrOptions?: number | ShowToastOptions,
    action?: ToastAction,
    variant?: ToastVariant
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 2000;

interface ToastState {
  message: string;
  isVisible: boolean;
  duration: number;
  key: number;
  variant: ToastVariant;
  action?: ToastAction;
}

function resolveArgs(
  durationOrOptions?: number | ShowToastOptions,
  action?: ToastAction,
  variant?: ToastVariant
) {
  if (typeof durationOrOptions === "number") {
    return {
      duration: durationOrOptions,
      action,
      variant: variant ?? ("success" as ToastVariant),
    };
  }

  if (durationOrOptions && typeof durationOrOptions === "object") {
    return {
      duration: durationOrOptions.duration ?? DEFAULT_DURATION,
      action: durationOrOptions.action ?? action,
      variant: durationOrOptions.variant ?? variant ?? ("success" as ToastVariant),
    };
  }

  return {
    duration: DEFAULT_DURATION,
    action,
    variant: variant ?? ("success" as ToastVariant),
  };
}

/**
 * 글로벌 토스트 Provider
 * 앱 전역에서 토스트를 사용할 수 있게 합니다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    isVisible: false,
    duration: DEFAULT_DURATION,
    key: 0,
    variant: "success",
  });

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback(
    (
      message: string,
      durationOrOptions?: number | ShowToastOptions,
      action?: ToastAction,
      variant?: ToastVariant
    ) => {
      const resolved = resolveArgs(durationOrOptions, action, variant);

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      // 기존 토스트를 숨기고 새 토스트 표시 (연속 호출 대응)
      setToast((prev) => ({
        message,
        isVisible: false,
        duration: resolved.duration,
        key: prev.key,
        variant: resolved.variant,
        action: resolved.action,
      }));

      toastTimeoutRef.current = setTimeout(() => {
        setToast((prev) => ({
          message,
          isVisible: true,
          duration: resolved.duration,
          key: prev.key + 1,
          variant: resolved.variant,
          action: resolved.action,
        }));
      }, 0);
    },
    []
  );

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        key={toast.key}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleClose}
        duration={toast.duration}
        variant={toast.variant}
        action={toast.action}
      />
    </ToastContext.Provider>
  );
}

/**
 * 글로벌 토스트 훅
 * ToastProvider 내부에서만 사용 가능합니다.
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 *
 * // 성공 토스트 (기본)
 * showToast("저장되었어요");
 *
 * // 경고 토스트 (옵션 객체 방식 - 권장)
 * showToast("이미 찜한 가게에요", { variant: "warning" });
 *
 * // 커스텀 duration (기존 방식 호환)
 * showToast("잠시만 기다려주세요", 3000);
 *
 * // 액션 포함 (기존 방식 호환)
 * showToast("차단이 해제되었어요", 3000, { label: "취소", onPress: () => {} });
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
