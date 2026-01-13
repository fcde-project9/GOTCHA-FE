"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common";

interface TimePickerModalProps {
  isOpen: boolean;
  initialTime?: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}

export function TimePickerModal({
  isOpen,
  initialTime = "오전 12:00",
  onClose,
  onSelect,
}: TimePickerModalProps) {
  const [period, setPeriod] = useState<"오전" | "오후">("오전");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (initialTime) {
      const match = initialTime.match(/(오전|오후)\s(\d+):(\d+)/);
      if (match) {
        setPeriod(match[1] as "오전" | "오후");

        // 시간 파싱 및 유효 범위로 정규화 (1-12)
        const parsedHour = parseInt(match[2]);
        const validHour = Number.isNaN(parsedHour) ? 12 : Math.max(1, Math.min(12, parsedHour));
        setHour(validHour);

        // 분 파싱 및 가장 가까운 옵션으로 정규화 (0 또는 30)
        const parsedMinute = parseInt(match[3]);
        const validMinute = Number.isNaN(parsedMinute) ? 0 : parsedMinute < 15 ? 0 : 30;
        setMinute(validMinute);
      }
    }
  }, [initialTime]);

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
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 30];

  const handleConfirm = () => {
    const timeString = `${period} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onSelect(timeString);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="time-picker-title"
        className="relative bg-white rounded-t-3xl w-full max-w-[480px] h-[375px] pt-5 pb-[52px] px-5 flex flex-col gap-7 items-center"
      >
        {/* Title */}
        <h2
          id="time-picker-title"
          className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900"
        >
          시간 선택
        </h2>

        {/* Time Picker */}
        <div className="flex gap-[11px] items-start w-[340px] h-[176px]">
          {/* Period Column (오전/오후) */}
          <div className="flex flex-col w-[104px] overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["오전", "오후"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as "오전" | "오후")}
                className={`p-2.5 text-center border-b flex-shrink-0 ${
                  period === p ? "border-main text-grey-900" : "border-transparent text-grey-300"
                }`}
              >
                <span className="text-[16px] leading-[1.5] tracking-[-0.16px]">{p}</span>
              </button>
            ))}
          </div>

          {/* Hour Column */}
          <div className="flex flex-col w-[104.5px] overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => setHour(h)}
                className={`p-2.5 text-center border-b flex-shrink-0 ${
                  hour === h ? "border-main text-grey-900" : "border-transparent text-grey-300"
                }`}
              >
                <span className="text-[16px] leading-[1.5] tracking-[-0.16px]">{h}</span>
              </button>
            ))}
          </div>

          {/* Minute Column */}
          <div className="flex flex-col w-[104px] overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => setMinute(m)}
                className={`p-2.5 text-center border-b flex-shrink-0 ${
                  minute === m ? "border-main text-grey-900" : "border-transparent text-grey-300"
                }`}
              >
                <span className="text-[16px] leading-[1.5] tracking-[-0.16px]">
                  {String(m).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between w-[335px] gap-2">
          <Button variant="tertiary" size="medium" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button variant="secondary" size="medium" onClick={handleConfirm} className="flex-1">
            선택완료
          </Button>
        </div>
      </div>
    </div>
  );
}
