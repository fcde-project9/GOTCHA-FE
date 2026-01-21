"use client";

import { Minus } from "lucide-react";
import { OperatingHoursEntry } from "@/types/report";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;

interface OperatingHoursItemProps {
  entry: OperatingHoursEntry;
  onDelete: (id: string) => void;
}

export function OperatingHoursItem({ entry, onDelete }: OperatingHoursItemProps) {
  // 요일 배열을 문자열로 변환
  const formatDays = (days: number[]): string => {
    if (days.length === 7) {
      return "매일";
    }
    return days.map((d) => DAYS_OF_WEEK[d]).join(", ");
  };

  // 시간 표시
  const formatTime = (): string => {
    if (entry.isUnknown) {
      return "시간 모름";
    }
    if (entry.is24Hours) {
      return "24시간";
    }
    return `${entry.openTime} ~ ${entry.closeTime}`;
  };

  return (
    <div className="flex items-center gap-3 bg-grey-50 rounded-lg px-5 py-4">
      <div className="flex-1 flex gap-1">
        <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-800">
          {formatDays(entry.days)}
        </span>
        <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-800">
          /
        </span>
        <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-800">
          {formatTime()}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-grey-500 hover:bg-grey-300 transition-colors"
        aria-label="삭제"
      >
        <Minus size={20} strokeWidth={1.5} className="stroke-white" />
      </button>
    </div>
  );
}
