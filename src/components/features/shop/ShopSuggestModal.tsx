"use client";

import { useState } from "react";
import type { ShopSuggestReason } from "@/api/types";

const SUGGEST_ITEMS: { value: ShopSuggestReason; label: string }[] = [
  { value: "WRONG_ADDRESS", label: "잘못된 주소예요" },
  { value: "WRONG_PHOTO", label: "매장 사진이 달라요" },
  { value: "WRONG_LOCATION_HINT", label: "매장 위치힌트가 달라요" },
  { value: "WRONG_BUSINESS_HOURS", label: "영업시간 정보가 달라요" },
  { value: "WRONG_PAYMENT_INFO", label: "카드 결제/ATM 등 결제 정보가 달라요" },
  { value: "OTHER", label: "기타" },
];

interface ShopSuggestModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (reasons: ShopSuggestReason[]) => void;
}

export function ShopSuggestModal({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}: ShopSuggestModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<Set<ShopSuggestReason>>(new Set());

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSelectedReasons(new Set());
    }
  }

  if (!isOpen) return null;

  const handleToggle = (reason: ShopSuggestReason) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) {
        next.delete(reason);
      } else {
        next.add(reason);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedReasons.size === 0) return;
    onSubmit(Array.from(selectedReasons));
  };

  const handleClose = () => {
    setSelectedReasons(new Set());
    onClose();
  };

  const isSubmitDisabled = selectedReasons.size === 0 || isLoading;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-[480px] mx-auto">
      <div className="flex-1 px-5 pt-8 overflow-y-auto">
        <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
          정보 수정 제안하기
        </h2>
        <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-error mt-[6px]">
          *중복선택 가능
        </p>
        <div className="mt-4 flex flex-col">
          {SUGGEST_ITEMS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleToggle(value)}
              className="flex items-center justify-between py-[18px] border-b border-grey-100 last:border-b-0"
            >
              <span className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 text-left">
                {label}
              </span>
              <div
                className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 ${
                  selectedReasons.has(value) ? "bg-main border-main" : "border-grey-300"
                }`}
              >
                {selectedReasons.has(value) && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 14 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 5L5 9L13 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 px-5 pb-safe pt-4">
        <button
          onClick={handleClose}
          className="flex-1 h-[52px] rounded-lg bg-grey-100 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-600"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-1 h-[52px] rounded-lg bg-main text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white disabled:bg-grey-200 disabled:text-grey-400"
        >
          {isLoading ? "제출 중..." : "제안하기"}
        </button>
      </div>
    </div>
  );
}
