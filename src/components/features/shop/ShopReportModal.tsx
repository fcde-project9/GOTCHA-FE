"use client";

import { useState } from "react";
import type { ShopReportReason } from "@/api/types";

const SHOP_REPORT_ITEMS: { value: ShopReportReason; label: string }[] = [
  { value: "SHOP_INAPPROPRIATE", label: "부적절한 업체(불법/유해 업소)예요" },
  { value: "SHOP_FALSE_INFO", label: "매장명/사진이 부적절해요" },
  { value: "SHOP_WRONG_ADDRESS", label: "위치 힌트에 부적절한 단어가 있어요" },
  { value: "SHOP_DUPLICATE", label: "중복 등록된 매장이에요" },
  { value: "SHOP_OTHER", label: "기타" },
];

interface ShopReportModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (reason: ShopReportReason, detail?: string) => void;
}

export function ShopReportModal({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}: ShopReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ShopReportReason | null>(null);
  const [detail, setDetail] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSelectedReason(null);
      setDetail("");
    }
  }

  if (!isOpen) return null;

  const isOtherSelected = selectedReason === "SHOP_OTHER";

  const handleSelect = (reason: ShopReportReason) => {
    setSelectedReason(reason === selectedReason ? null : reason);
    if (reason !== "SHOP_OTHER") {
      setDetail("");
    }
  };

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, isOtherSelected ? detail.trim() || undefined : undefined);
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetail("");
    onClose();
  };

  const isSubmitDisabled = !selectedReason || (isOtherSelected && !detail.trim()) || isLoading;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white flex flex-col max-w-[480px] mx-auto h-safe-viewport">
      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
          매장 문제 신고
        </h2>
        <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-500 mt-[6px]">
          <span className="font-semibold text-grey-900">3건 이상</span>의 요청이 들어오면 자동
          삭제돼요
        </p>
        <div className="mt-4 flex flex-col gap-[24px]">
          {SHOP_REPORT_ITEMS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="flex items-center justify-between"
            >
              <span className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 text-left">
                {label}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  selectedReason === value ? "bg-main" : "border-2 border-grey-300"
                }`}
              >
                {selectedReason === value && (
                  <svg
                    width="12"
                    height="12"
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

          {isOtherSelected && (
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="직접 입력하기"
              maxLength={200}
              className="w-full border-b border-grey-300 pb-2 text-[16px] leading-[1.5] tracking-[-0.16px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-main"
            />
          )}
        </div>
      </div>
      <div className="flex gap-3 px-5 pb-[52px] pt-4">
        <button
          onClick={handleClose}
          className="flex-1 h-[44px] rounded-lg bg-grey-100 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-900"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-1 h-[44px] rounded-lg bg-main text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white disabled:bg-grey-200 disabled:text-grey-500"
        >
          {isLoading ? "신고 접수 중..." : "신고하기"}
        </button>
      </div>
    </div>
  );
}
