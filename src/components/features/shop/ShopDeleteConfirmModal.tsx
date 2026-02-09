"use client";

import { useEffect } from "react";

interface ShopDeleteConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  shopName: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 가게 삭제 확인 모달 컴포넌트 (ADMIN 전용)
 */
export function ShopDeleteConfirmModal({
  isOpen,
  isLoading = false,
  shopName,
  onClose,
  onConfirm,
}: ShopDeleteConfirmModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        role="dialog"
        aria-labelledby="shop-delete-modal-title"
        className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-6"
      >
        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h2
            id="shop-delete-modal-title"
            className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center"
          >
            가게를 삭제할까요?
          </h2>
          <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700 text-center">
            <span className="font-medium">&ldquo;{shopName}&rdquo;</span>
            <br />
            삭제된 가게는 복구할 수 없어요
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-lg bg-error text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white disabled:opacity-50"
          >
            {isLoading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
