"use client";

import { useEffect, useRef, useState } from "react";

interface ModalShellProps {
  isOpen: boolean;
  onClose?: () => void;
  backdropClassName?: string;
  closeOnBackdropClick?: boolean;
  zIndexClass?: string;
  children: React.ReactNode;
}

const EXIT_DURATION_MS = 200;

/**
 * 모달/팝업 표준 wrapper.
 * iOS Alert 호환 모션 (backdrop fade + content scale+fade).
 * isOpen=false 시 즉시 unmount하지 않고 exit 애니메이션 재생 후 unmount.
 */
export function ModalShell({
  isOpen,
  onClose,
  backdropClassName = "bg-black/70",
  closeOnBackdropClick = false,
  zIndexClass = "z-50",
  children,
}: ModalShellProps) {
  const [isClosing, setIsClosing] = useState(false);
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    // 외부 prop 변화(isOpen → false)에 동기화 — exit 애니메이션 트리거
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClosing(true);
    wasOpen.current = false;
    const timer = setTimeout(() => {
      setIsClosing(false);
    }, EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center`}>
      <div
        className={`absolute inset-0 ${backdropClassName} ${isClosing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"}`}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 ${isClosing ? "animate-modal-content-out" : "animate-modal-content-in"}`}
      >
        {children}
      </div>
    </div>
  );
}
