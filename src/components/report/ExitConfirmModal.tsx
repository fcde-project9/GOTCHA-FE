"use client";

import { useEffect } from "react";
import { Button } from "@/components/common";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExitConfirmModal({ isOpen, onClose, onConfirm }: ExitConfirmModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="exit-confirm-title"
        aria-describedby="exit-confirm-description"
        className="relative bg-white rounded-2xl w-[335px] p-4 flex flex-col gap-5"
      >
        {/* Content */}
        <div className="flex flex-col gap-1 text-center">
          <h2
            id="exit-confirm-title"
            className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900"
          >
            다음에 할까요?
          </h2>
          <p
            id="exit-confirm-description"
            className="text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-600"
          >
            지금까지 입력한 정보가 저장되지 않아요
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="tertiary" size="medium" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button variant="secondary" size="medium" onClick={onConfirm} className="flex-1">
            나가기
          </Button>
        </div>
      </div>
    </div>
  );
}
