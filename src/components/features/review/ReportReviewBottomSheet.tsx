"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type {
  ReportReason,
  ReportTargetType,
  ReviewReportReason,
  ShopReportReason,
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

const SHOP_REASONS: { value: ShopReportReason; label: string }[] = [
  { value: "SHOP_WRONG_ADDRESS", label: "잘못된 주소예요" },
  { value: "SHOP_CLOSED", label: "영업 종료/폐업된 업체예요" },
  { value: "SHOP_INAPPROPRIATE", label: "부적절한 업체(불법/유해 업소)예요" },
  { value: "SHOP_DUPLICATE", label: "중복 제보된 업체예요" },
  { value: "SHOP_FALSE_INFO", label: "허위/거짓 정보예요" },
  { value: "SHOP_OTHER", label: "기타" },
];

const USER_REASONS: { value: UserReportReason; label: string }[] = [
  { value: "USER_INAPPROPRIATE_NICKNAME", label: "부적절한 닉네임이에요" },
  { value: "USER_INAPPROPRIATE_PROFILE", label: "부적절한 프로필 사진이에요" },
  { value: "USER_PRIVACY", label: "개인정보가 노출되어 있어요" },
  { value: "USER_IMPERSONATION", label: "다른 사람을 사칭하고 있어요" },
  { value: "USER_HATE_SPEECH", label: "혐오 표현이 포함돼있어요" },
  { value: "USER_OTHER", label: "기타" },
];

const REASONS_BY_TARGET: Record<ReportTargetType, { value: ReportReason; label: string }[]> = {
  REVIEW: REVIEW_REASONS,
  SHOP: SHOP_REASONS,
  USER: USER_REASONS,
};

const TARGET_TITLE: Record<ReportTargetType, string> = {
  REVIEW: "리뷰",
  SHOP: "게시글",
  USER: "사용자",
};

const OTHER_REASONS: Set<ReportReason> = new Set(["REVIEW_OTHER", "SHOP_OTHER", "USER_OTHER"]);

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

  const reasons = REASONS_BY_TARGET[targetType];
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
    setSelectedReason(null);
    setDetail("");
    onClose();
  };

  const isSubmitDisabled = !selectedReason || (isOtherSelected && !detail.trim()) || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/80" onClick={handleClose}>
      <div
        className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-[52px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-[5px] border-b border-grey-50">
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
              {TARGET_TITLE[targetType]} <span className="text-main">신고하기</span>
            </h2>
            <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-500">
              * 신고는 익명으로 제보됩니다
            </p>
          </div>
          <button onClick={handleClose} className="p-1 self-start">
            <X size={24} className="text-grey-700" />
          </button>
        </div>

        {/* Reason List */}
        <div className="flex flex-col gap-[18px] py-[18px] max-h-[50vh] overflow-y-auto">
          {reasons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className="flex items-center justify-between"
            >
              <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900">
                {label}
              </span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  selectedReason === value ? "bg-main" : "border-2 border-grey-300"
                }`}
              >
                {selectedReason === value && (
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

          {/* 기타 사유 입력 */}
          {isOtherSelected && (
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="신고 사유를 입력해주세요"
              maxLength={500}
              className="w-full h-24 p-3 border border-grey-200 rounded-lg text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-900 placeholder:text-grey-400 resize-none focus:outline-none focus:border-main"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full h-11 rounded-lg bg-[#FF4545] text-[16px] font-semibold leading-[1.5] tracking-[-0.35px] text-white disabled:bg-grey-200 disabled:text-grey-400"
        >
          {isLoading ? "신고 접수 중..." : "신고하기"}
        </button>
      </div>
    </div>
  );
}
