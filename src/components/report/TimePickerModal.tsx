"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/common";

interface TimePickerModalProps {
  isOpen: boolean;
  initialTime?: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}

const ITEM_HEIGHT = 44; // 각 아이템 높이

export function TimePickerModal({
  isOpen,
  initialTime = "오전 12:00",
  onClose,
  onSelect,
}: TimePickerModalProps) {
  const [period, setPeriod] = useState<"오전" | "오후">("오전");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const periodRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const periods = ["오전", "오후"] as const;
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 30];

  // 스크롤 위치로 선택된 값 계산
  const getSelectedIndex = useCallback((scrollTop: number) => {
    return Math.round(scrollTop / ITEM_HEIGHT);
  }, []);

  // 특정 인덱스로 스크롤
  const scrollToIndex = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
      if (ref.current) {
        ref.current.scrollTo({
          top: index * ITEM_HEIGHT,
          behavior: "smooth",
        });
      }
    },
    []
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (
      ref: React.RefObject<HTMLDivElement | null>,
      items: readonly string[] | number[],
      setValue: (value: never) => void
    ) => {
      if (!ref.current) return;

      const index = getSelectedIndex(ref.current.scrollTop);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      setValue(items[clampedIndex] as never);
    },
    [getSelectedIndex]
  );

  // 스크롤 종료 시 스냅
  const handleScrollEnd = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, items: readonly string[] | number[]) => {
      if (!ref.current) return;

      const index = getSelectedIndex(ref.current.scrollTop);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      scrollToIndex(ref, clampedIndex);
    },
    [getSelectedIndex, scrollToIndex]
  );

  // 초기값 설정
  useEffect(() => {
    if (!isOpen) return;

    if (initialTime) {
      const match = initialTime.match(/(오전|오후)\s(\d+):(\d+)/);
      if (match) {
        const parsedPeriod = match[1] as "오전" | "오후";
        setPeriod(parsedPeriod);

        const parsedHour = parseInt(match[2]);
        const validHour = Number.isNaN(parsedHour) ? 12 : Math.max(1, Math.min(12, parsedHour));
        setHour(validHour);

        const parsedMinute = parseInt(match[3]);
        const validMinute = Number.isNaN(parsedMinute) ? 0 : parsedMinute < 15 ? 0 : 30;
        setMinute(validMinute);

        // 초기 스크롤 위치 설정
        setTimeout(() => {
          const periodIndex = periods.indexOf(parsedPeriod);
          const hourIndex = hours.indexOf(validHour);
          const minuteIndex = minutes.indexOf(validMinute);

          if (periodRef.current) {
            periodRef.current.scrollTop = periodIndex * ITEM_HEIGHT;
          }
          if (hourRef.current) {
            hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
          }
          if (minuteRef.current) {
            minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
          }
        }, 0);
      }
    }
  }, [isOpen, initialTime]);

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

  // 스크롤 이벤트 등록
  useEffect(() => {
    if (!isOpen) return;

    const periodEl = periodRef.current;
    const hourEl = hourRef.current;
    const minuteEl = minuteRef.current;

    const timeouts: { period?: NodeJS.Timeout; hour?: NodeJS.Timeout; minute?: NodeJS.Timeout } =
      {};

    const createScrollHandler = (
      ref: React.RefObject<HTMLDivElement | null>,
      items: readonly string[] | number[],
      setValue: (value: never) => void,
      timeoutKey: "period" | "hour" | "minute"
    ) => {
      return () => {
        handleScroll(ref, items, setValue);

        if (timeouts[timeoutKey]) {
          clearTimeout(timeouts[timeoutKey]);
        }
        timeouts[timeoutKey] = setTimeout(() => {
          handleScrollEnd(ref, items);
        }, 100);
      };
    };

    const periodHandler = createScrollHandler(
      periodRef,
      periods,
      setPeriod as (value: never) => void,
      "period"
    );
    const hourHandler = createScrollHandler(
      hourRef,
      hours,
      setHour as (value: never) => void,
      "hour"
    );
    const minuteHandler = createScrollHandler(
      minuteRef,
      minutes,
      setMinute as (value: never) => void,
      "minute"
    );

    periodEl?.addEventListener("scroll", periodHandler);
    hourEl?.addEventListener("scroll", hourHandler);
    minuteEl?.addEventListener("scroll", minuteHandler);

    return () => {
      periodEl?.removeEventListener("scroll", periodHandler);
      hourEl?.removeEventListener("scroll", hourHandler);
      minuteEl?.removeEventListener("scroll", minuteHandler);
      if (timeouts.period) clearTimeout(timeouts.period);
      if (timeouts.hour) clearTimeout(timeouts.hour);
      if (timeouts.minute) clearTimeout(timeouts.minute);
    };
  }, [isOpen, handleScroll, handleScrollEnd]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const timeString = `${period} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onSelect(timeString);
    onClose();
  };

  // 아이템 클릭 시 해당 위치로 스크롤
  const handleItemClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
    items: readonly string[] | number[],
    setValue: (value: never) => void
  ) => {
    setValue(items[index] as never);
    scrollToIndex(ref, index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="time-picker-title"
        className="relative bg-white rounded-t-3xl w-full max-w-[480px] pt-5 pb-[52px] px-5 flex flex-col gap-5 items-center"
      >
        {/* Title */}
        <h2
          id="time-picker-title"
          className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900"
        >
          시간 선택
        </h2>

        {/* Time Picker */}
        <div className="flex gap-2 w-full max-w-[340px] h-[176px]">
          {/* Period Column (오전/오후) */}
          <div className="relative flex-1 h-full">
            {/* 고정된 선택 표시선 */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[44px] pointer-events-none z-10">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-main" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-main" />
            </div>
            {/* 상단/하단 그라데이션 */}
            <div className="absolute inset-x-0 top-0 h-[66px] bg-gradient-to-b from-white to-transparent pointer-events-none z-[5]" />
            <div className="absolute inset-x-0 bottom-0 h-[66px] bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />
            {/* 스크롤 영역 */}
            <div
              ref={periodRef}
              className="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory"
              style={{ paddingTop: "66px", paddingBottom: "66px" }}
            >
              {periods.map((p, index) => (
                <button
                  key={p}
                  onClick={() =>
                    handleItemClick(periodRef, index, periods, setPeriod as (value: never) => void)
                  }
                  className={`w-full h-[44px] flex items-center justify-center snap-center transition-colors ${
                    period === p ? "text-grey-900" : "text-grey-300"
                  }`}
                >
                  <span className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px]">
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hour Column */}
          <div className="relative flex-1 h-full">
            {/* 고정된 선택 표시선 */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[44px] pointer-events-none z-10">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-main" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-main" />
            </div>
            {/* 상단/하단 그라데이션 */}
            <div className="absolute inset-x-0 top-0 h-[66px] bg-gradient-to-b from-white to-transparent pointer-events-none z-[5]" />
            <div className="absolute inset-x-0 bottom-0 h-[66px] bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />
            {/* 스크롤 영역 */}
            <div
              ref={hourRef}
              className="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory"
              style={{ paddingTop: "66px", paddingBottom: "66px" }}
            >
              {hours.map((h, index) => (
                <button
                  key={h}
                  onClick={() =>
                    handleItemClick(hourRef, index, hours, setHour as (value: never) => void)
                  }
                  className={`w-full h-[44px] flex items-center justify-center snap-center transition-colors ${
                    hour === h ? "text-grey-900" : "text-grey-300"
                  }`}
                >
                  <span className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px]">
                    {h}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Minute Column */}
          <div className="relative flex-1 h-full">
            {/* 고정된 선택 표시선 */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[44px] pointer-events-none z-10">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-main" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-main" />
            </div>
            {/* 상단/하단 그라데이션 */}
            <div className="absolute inset-x-0 top-0 h-[66px] bg-gradient-to-b from-white to-transparent pointer-events-none z-[5]" />
            <div className="absolute inset-x-0 bottom-0 h-[66px] bg-gradient-to-t from-white to-transparent pointer-events-none z-[5]" />
            {/* 스크롤 영역 */}
            <div
              ref={minuteRef}
              className="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-y snap-mandatory"
              style={{ paddingTop: "66px", paddingBottom: "66px" }}
            >
              {minutes.map((m, index) => (
                <button
                  key={m}
                  onClick={() =>
                    handleItemClick(minuteRef, index, minutes, setMinute as (value: never) => void)
                  }
                  className={`w-full h-[44px] flex items-center justify-center snap-center transition-colors ${
                    minute === m ? "text-grey-900" : "text-grey-300"
                  }`}
                >
                  <span className="text-[16x] font-normal leading-[1.5] tracking-[-0.16px]">
                    {String(m).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between w-full max-w-[340px] gap-2">
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
