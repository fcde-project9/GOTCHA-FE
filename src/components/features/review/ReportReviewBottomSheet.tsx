"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  ReportReason,
  ReportTargetType,
  ReviewReportReason,
  UserReportReason,
} from "@/api/types";

const REVIEW_REASONS: { value: ReviewReportReason; label: string }[] = [
  { value: "REVIEW_SPAM", label: "글이 도배되어 있어요" },
  { value: "REVIEW_COPYRIGHT", label: "저작권 침해가 우려돼요" },
  { value: "REVIEW_DEFAMATION", label: "명예를 훼손하는 내용이에요" },
  { value: "REVIEW_ABUSE", label: "욕설이나 비방이 심해요" },
  { value: "REVIEW_VIOLENCE", label: "폭력적이거나 위협적인 내용이에요" },
  { value: "REVIEW_OBSCENE", label: "외설적인 내용이 포함돼있어요" },
  { value: "REVIEW_PRIVACY", label: "개인정보가 노출되어 있어요" },
  { value: "REVIEW_HATE_SPEECH", label: "혐오 표현이 포함돼있어요" },
  { value: "REVIEW_FALSE_INFO", label: "허위/거짓 정보예요" },
  { value: "REVIEW_OTHER", label: "기타" },
];

const USER_REASONS: { value: UserReportReason; label: string }[] = [
  { value: "USER_INAPPROPRIATE_NICKNAME", label: "부적절한 닉네임이에요" },
  { value: "USER_INAPPROPRIATE_PROFILE", label: "부적절한 프로필 사진이에요" },
  { value: "USER_PRIVACY", label: "개인정보가 노출되어 있어요" },
  { value: "USER_IMPERSONATION", label: "다른 사람을 사칭하고 있어요" },
  { value: "USER_HATE_SPEECH", label: "혐오 표현이 포함돼있어요" },
  { value: "USER_OTHER", label: "기타" },
];

const REASONS_BY_TARGET: Partial<
  Record<ReportTargetType, { value: ReportReason; label: string }[]>
> = {
  REVIEW: REVIEW_REASONS,
  USER: USER_REASONS,
};

const TARGET_TITLE: Record<string, string> = {
  REVIEW: "리뷰",
  USER: "사용자",
};

const OTHER_REASONS: Set<ReportReason> = new Set(["REVIEW_OTHER", "USER_OTHER"]);

interface ReportBottomSheetProps {
  isOpen: boolean;
  isLoading?: boolean;
  targetType: ReportTargetType;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail?: string) => void;
}

export function ReportBottomSheet({
  isOpen,
  isLoading = false,
  targetType,
  onClose,
  onSubmit,
}: ReportBottomSheetProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
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

  const reasons = REASONS_BY_TARGET[targetType] ?? [];
  const isOtherSelected = selectedReason !== null && OTHER_REASONS.has(selectedReason);

  const handleSelect = (reason: ReportReason) => {
    setSelectedReason(reason === selectedReason ? null : reason);
    if (!OTHER_REASONS.has(reason)) {
      setDetail("");
    }
  };

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, isOtherSelected ? detail.trim() || undefined : undefined);
  };

  const handleClose = () => {
    onClose();
  };

  const isSubmitDisabled = !selectedReason || (isOtherSelected && !detail.trim()) || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={handleClose}>
      <div
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-3xl px-5 pt-5 pb-[52px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-[5px] border-b border-grey-50">
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
              {TARGET_TITLE[targetType]} <span className="text-main">신고하기</span>
            </h2>
            <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-400">
              * 신고는 익명으로 제보됩니다
            </p>
          </div>
          <button onClick={handleClose} className="p-1 self-start">
            <X size={24} className="text-grey-700" />
          </button>
        </div>

        {/* Reason List */}
        <div className="flex flex-col gap-[24px] py-[18px] max-h-[50vh] overflow-y-auto">
          {reasons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="flex items-center justify-between"
            >
              <span className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900">
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

          {/* 기타 사유 입력 */}
          {isOtherSelected && (
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="신고 사유를 입력해주세요"
              maxLength={500}
              className="w-full min-h-32 shrink-0 p-3 border border-grey-200 rounded-lg text-[16px] leading-[1.5] tracking-[-0.16px] text-grey-600 placeholder:text-grey-400 resize-none focus:outline-none focus:border-main"
            />
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full h-[46px] rounded-lg bg-main text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white disabled:bg-grey-200 disabled:text-grey-400"
        >
          {isLoading ? "신고 접수 중..." : "신고하기"}
        </button>
      </div>
    </div>
  );
}
