"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type ToastVariant = "success" | "warning";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
  action?: ToastAction;
}

const ANIMATION_MS = 700;

const ICON_MAP: Record<ToastVariant, string> = {
  success: "/images/icons/toast-check.svg",
  warning: "/images/icons/toast-warning.svg",
};

export function Toast({
  message,
  isVisible,
  onClose,
  duration = 2000,
  variant = "success",
  action,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const fadeInTimer = setTimeout(() => setShow(true), 10);
    const fadeOutTimer = setTimeout(() => {
      setShow(false);
    }, duration);
    const closeTimer = setTimeout(() => onClose(), duration + ANIMATION_MS);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(closeTimer);
      setShow(false);
    };
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-[48px] left-1/2 z-50 -translate-x-1/2 transition-all duration-700 ease-out ${
        show ? "translate-y-0 opacity-100" : "-translate-y-[200%] opacity-0"
      }`}
    >
      <div className="w-[calc(100vw-30px)] max-w-[345px] min-h-[53px] bg-grey-900 rounded-[10px] px-[18px] py-[14px] shadow-lg flex items-center gap-3">
        {!action && (
          <Image src={ICON_MAP[variant]} alt="" width={20} height={20} className="shrink-0" />
        )}
        <p className="flex-1 text-[16px] font-medium leading-[1.5] text-white break-words">
          {message}
        </p>
        {action && (
          <button
            onClick={() => {
              action.onPress();
              onClose();
            }}
            className="text-[16px] font-normal leading-[1.5] text-[#7dcfff] whitespace-nowrap shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
