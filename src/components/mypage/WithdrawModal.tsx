"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/common";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasons: string[], otherReason?: string) => void;
}

const WITHDRAW_REASONS = [
  { label: "사용을 잘 안하게 돼요", value: "LOW_USAGE" },
  { label: "가챠샵 정보가 부족해요", value: "INSUFFICIENT_INFO" },
  { label: "가챠샵 정보가 기재된 내용과 달라요", value: "INACCURATE_INFO" },
  { label: "다른 계정이 있어요", value: "HAS_OTHER_ACCOUNT" },
  { label: "기타", value: "OTHER" },
] as const;

/**
 * 회원탈퇴 설문 모달 컴포넌트
 */
export function WithdrawModal({ isOpen, onClose, onConfirm }: WithdrawModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      /* eslint-disable react-hooks/set-state-in-effect -- isOpen=false일 때 상태 리셋 */
      setSelectedReasons([]);
      setOtherReason("");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setOtherReason("");
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(selectedReasons, otherReason);
  };

  const isOtherSelected = selectedReasons.includes("OTHER");
  const isButtonDisabled = selectedReasons.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-white">
      <div className="w-full max-w-[480px] flex flex-col bg-white mt-[env(safe-area-inset-top)] h-[calc(100%-env(safe-area-inset-top))]">
        {/* Header */}
        <header className="shrink-0 flex w-full h-[48px] items-center justify-between bg-default px-[20px] py-[8px]">
          <h1 className="flex-1 text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
            회원탈퇴
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          {/* Title */}
          <div className="mb-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
                떠나시는 이유를 알고 싶어요
              </h2>
              <p className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-main">
                * 중복선택 가능
              </p>
            </div>
          </div>

          {/* Reasons List */}
          <div className="flex flex-col gap-6 mb-6">
            {WITHDRAW_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center justify-between">
                <span className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900">
                  {reason.label}
                </span>
                <Checkbox
                  checked={selectedReasons.includes(reason.value)}
                  onChange={() => handleReasonToggle(reason.value)}
                  variant="outlined"
                />
              </div>
            ))}
          </div>

          {/* Other Reason Input */}
          {isOtherSelected && (
            <div className="mt-3 mb-6">
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="직접 입력하기"
                className="w-full border-b border-[#ffcdd1] py-2.5 pr-2.5 text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600 placeholder:text-grey-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-5 pb-8 pt-4 flex gap-[9px]">
          <button
            onClick={handleClose}
            className="flex-1 h-[46px] rounded-lg bg-grey-100 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-900"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className="flex-1 h-[46px] rounded-lg bg-main text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white disabled:bg-grey-200 disabled:text-grey-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
