"use client";

import { useEffect, useRef, useState } from "react";
import { useSuggestReasons } from "@/api/queries/useSuggestReasons";
import type { ShopSuggestReason } from "@/api/types";
import { useKeyboardHeight } from "@/hooks";

interface ShopSuggestModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (reasons: ShopSuggestReason[], detail?: string) => void;
}

export function ShopSuggestModal({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}: ShopSuggestModalProps) {
  const { data: suggestItems, isLoading: isReasonsLoading } = useSuggestReasons();
  const [selectedReasons, setSelectedReasons] = useState<Set<ShopSuggestReason>>(new Set());
  const [detail, setDetail] = useState("");
  const keyboardHeight = useKeyboardHeight(isOpen);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSelectedReasons(new Set());
      setDetail("");
    }
  }

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 키보드가 올라왔을 때 textarea로 스크롤
  useEffect(() => {
    if (keyboardHeight > 0 && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [keyboardHeight]);

  if (!isOpen) return null;

  const isOtherSelected = selectedReasons.has("OTHER");

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
    if (reason !== "OTHER") {
      // keep detail as-is
    }
  };

  const handleSubmit = () => {
    if (selectedReasons.size === 0) return;
    onSubmit(Array.from(selectedReasons), isOtherSelected ? detail.trim() || undefined : undefined);
  };

  const handleClose = () => {
    setSelectedReasons(new Set());
    setDetail("");
    onClose();
  };

  const isSubmitDisabled =
    selectedReasons.size === 0 ||
    (isOtherSelected && !detail.trim()) ||
    isLoading ||
    isReasonsLoading;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white flex flex-col max-w-[480px] mx-auto h-safe-viewport">
      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
          매장 정보 수정 제안
        </h2>
        <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-error mt-[6px]">
          *중복선택 가능
        </p>
        <div className="mt-6 flex flex-col gap-6">
          {isReasonsLoading || !suggestItems
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-[25px] w-2/3 bg-grey-100 rounded" />
                  <div className="w-5 h-5 rounded-[4px] border-2 border-grey-300 shrink-0" />
                </div>
              ))
            : suggestItems.map(({ code, description }) => (
                <button
                  key={code}
                  onClick={() => handleToggle(code)}
                  className="flex items-center justify-between"
                >
                  <span className="text-[17px] font-normal leading-[1.5] tracking-[-0.17px] text-grey-900 text-left">
                    {description}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 ${
                      selectedReasons.has(code) ? "bg-main border-main" : "border-grey-300"
                    }`}
                  >
                    {selectedReasons.has(code) && (
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

          {isOtherSelected && (
            <textarea
              ref={textareaRef}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              placeholder="제안 사유를 입력해주세요"
              maxLength={500}
              className="w-full min-h-32 shrink-0 p-3 border border-grey-200 rounded-lg text-[16px] leading-[1.5] tracking-[-0.16px] text-grey-600 placeholder:text-grey-400 resize-none focus:outline-none focus:border-main"
            />
          )}
        </div>
      </div>
      <div
        className="flex gap-3 px-5 pt-4"
        style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : 52 }}
      >
        <button
          onClick={handleClose}
          className="flex-1 h-[44px] rounded-lg bg-grey-100 text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-grey-900"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-1 h-[44px] rounded-lg bg-main text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-white disabled:bg-grey-200 disabled:text-grey-500"
        >
          {isLoading ? "제출 중..." : "제안하기"}
        </button>
      </div>
    </div>
  );
}
