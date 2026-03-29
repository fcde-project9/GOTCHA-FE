"use client";

import { useEffect, useRef, useState } from "react";
import type { ShopReportReason } from "@/api/types";
import { isNativeApp } from "@/utils/platform";

const SHOP_REPORT_REASONS: { value: ShopReportReason; label: string }[] = [
  { value: "SHOP_CLOSED", label: "영업 종료/폐업된 업체예요" },
  { value: "SHOP_INAPPROPRIATE", label: "부적절한 업체(불법/유해 업소)예요" },
  { value: "SHOP_DUPLICATE", label: "중복 제보된 업체예요" },
  { value: "SHOP_FALSE_INFO", label: "허위/거짓 정보예요" },
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSelectedReason(null);
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
        <div className="mt-6 flex flex-col gap-6">
          {SHOP_REPORT_REASONS.map(({ value, label }) => (
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
            <textarea
              ref={textareaRef}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              placeholder="신고 사유를 입력해주세요"
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
          {isLoading ? "신고 접수 중..." : "신고하기"}
        </button>
      </div>
    </div>
  );
}
