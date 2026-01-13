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

interface ToastContextValue {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastState {
  message: string;
  isVisible: boolean;
  duration: number;
  key: number;
}

/**
 * 글로벌 토스트 Provider
 * 앱 전역에서 토스트를 사용할 수 있게 합니다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    isVisible: false,
    duration: 2000,
    key: 0,
  });

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, duration: number = 2000) => {
    // 기존 타이머 정리
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // 먼저 기존 토스트를 숨기고 새로운 토스트를 표시 (연속 호출 대응)
    setToast((prev) => ({
      message,
      isVisible: false,
      duration,
      key: prev.key,
    }));

    // 다음 틱에서 새 토스트 표시
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({
        message,
        isVisible: true,
        duration,
        key: prev.key + 1,
      }));
    }, 0);
  }, []);

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
 * const handleClick = () => {
 *   showToast("저장되었어요");
 * };
 *
 * // 커스텀 duration
 * showToast("잠시만 기다려주세요", 3000);
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
