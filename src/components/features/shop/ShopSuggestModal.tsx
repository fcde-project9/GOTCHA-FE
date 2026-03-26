"use client";

import { useEffect, useRef, useState } from "react";
import type { ShopSuggestReason } from "@/api/types";
import { isNativeApp } from "@/utils/platform";

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
  onSubmit: (reasons: ShopSuggestReason[], detail?: string) => void;
}

export function ShopSuggestModal({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}: ShopSuggestModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<Set<ShopSuggestReason>>(new Set());
  const [detail, setDetail] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  // 키보드 높이 감지
  useEffect(() => {
    if (!isOpen) {
      setKeyboardHeight(0);
      return;
    }

    if (isNativeApp()) {
      let cancelled = false;
      let showListener: { remove: () => void | Promise<void> } | undefined;
      let hideListener: { remove: () => void | Promise<void> } | undefined;

      (async () => {
        try {
          const { Keyboard } = await import("@capacitor/keyboard");
          if (cancelled) return;

          showListener = await Keyboard.addListener("keyboardWillShow", (info) => {
            setKeyboardHeight(info.keyboardHeight);
          });
          hideListener = await Keyboard.addListener("keyboardWillHide", () => {
            setKeyboardHeight(0);
          });
        } catch {
          setKeyboardHeight(0);
        }
      })();

      return () => {
        cancelled = true;
        showListener?.remove();
        hideListener?.remove();
      };
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const height = window.innerHeight - viewport.height;
      setKeyboardHeight(height > 0 ? height : 0);
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
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
    selectedReasons.size === 0 || (isOtherSelected && !detail.trim()) || isLoading;

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
          {SUGGEST_ITEMS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleToggle(value)}
              className="flex items-center justify-between"
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
