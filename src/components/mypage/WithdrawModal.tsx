"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/common";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasons: string[], otherReason?: string) => void;
}

const WITHDRAW_REASONS = [
  "사용을 잘 안하게 돼요",
  "가자상 정보가 부족해요",
  "가자상 정보가 거래된 내용과 달라요",
  "다른 계정이 있어요",
  "기타",
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
      setSelectedReasons([]);
      setOtherReason("");
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
    // 확인 후 상태 초기화
    setSelectedReasons([]);
    setOtherReason("");
  };

  const isOtherSelected = selectedReasons.includes("기타");
  const isButtonDisabled = selectedReasons.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white h-12 flex items-center px-5 py-2 border-b border-line-100">
          <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            회원탈퇴
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold leading-[1.5] tracking-[-0.2px] text-grey-900 mb-2">
              떠나시는 이유를 알고 싶어요
            </h2>
            <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-main-500">
              * 중복선택 가능
            </p>
          </div>

          {/* Reasons List */}
          <div className="flex flex-col gap-4 mb-6">
            {WITHDRAW_REASONS.map((reason) => (
              <div key={reason} className="flex items-center justify-between">
                <span className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-900">
                  {reason}
                </span>
                <Checkbox
                  checked={selectedReasons.includes(reason)}
                  onChange={() => handleReasonToggle(reason)}
                  variant="outlined"
                />
              </div>
            ))}
          </div>

          {/* Other Reason Input */}
          {isOtherSelected && (
            <div className="mb-6">
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="직접 입력하기"
                className="w-full h-12 px-4 rounded-lg border border-line-100 text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-line-100"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-5 pb-8 pt-4 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className="flex-1 h-12 rounded-lg bg-main-500 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white disabled:bg-grey-300 disabled:text-grey-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
