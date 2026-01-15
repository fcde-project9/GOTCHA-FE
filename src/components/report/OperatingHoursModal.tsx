"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button, Checkbox } from "@/components/common";
import { TimePickerModal } from "./TimePickerModal";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;

export interface OperatingHoursEntry {
  id: string;
  days: number[];
  openTime: string;
  closeTime: string;
  isUnknown: boolean;
}

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: OperatingHoursEntry) => void;
  existingDays?: number[]; // 이미 선택된 요일들 (중복 방지용)
}

export function OperatingHoursModal({
  isOpen,
  onClose,
  onConfirm,
  existingDays = [],
}: OperatingHoursModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isEveryDay, setIsEveryDay] = useState(false);
  const [openTime, setOpenTime] = useState("오전 10:00");
  const [closeTime, setCloseTime] = useState("오후 10:00");
  const [isUnknown, setIsUnknown] = useState(false);
  const [isOpenTimeModalOpen, setIsOpenTimeModalOpen] = useState(false);
  const [isCloseTimeModalOpen, setIsCloseTimeModalOpen] = useState(false);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedDays([]);
      setIsEveryDay(false);
      setOpenTime("오전 10:00");
      setCloseTime("오후 10:00");
      setIsUnknown(false);
    }
  }, [isOpen]);

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

  // 선택 가능한 요일 (이미 등록된 요일 제외)
  const availableDays = [0, 1, 2, 3, 4, 5, 6].filter((day) => !existingDays.includes(day));

  const handleDayToggle = (dayIndex: number) => {
    if (existingDays.includes(dayIndex)) return;

    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleEveryDayToggle = (checked: boolean) => {
    setIsEveryDay(checked);
    if (checked) {
      setSelectedDays(availableDays);
    } else {
      setSelectedDays([]);
    }
  };

  const handleUnknownToggle = (checked: boolean) => {
    setIsUnknown(checked);
  };

  const handleConfirm = () => {
    if (selectedDays.length === 0) return;

    const entry: OperatingHoursEntry = {
      id: Date.now().toString(),
      days: [...selectedDays].sort((a, b) => a - b),
      openTime,
      closeTime,
      isUnknown,
    };

    onConfirm(entry);
    onClose();
  };

  const isValid = selectedDays.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

        {/* Modal */}
        <div
          role="dialog"
          aria-labelledby="operating-hours-modal-title"
          className="relative bg-white rounded-t-3xl w-full max-w-[480px] pt-5 pb-[52px] px-5 flex flex-col gap-5"
        >
          {/* Title */}
          <h2
            id="operating-hours-modal-title"
            className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center"
          >
            영업시간 설정
          </h2>

          {/* 영업일 Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-grey-900">
                영업일
              </label>
              <Checkbox
                checked={isEveryDay}
                onChange={handleEveryDayToggle}
                label="매일"
                variant="filled"
                size="small"
              />
            </div>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day, index) => {
                const isDisabled = existingDays.includes(index);
                const isSelected = selectedDays.includes(index);

                return (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(index)}
                    disabled={isDisabled}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-medium leading-[1.5] tracking-[-0.16px] transition-colors ${
                      isDisabled
                        ? "bg-grey-200 text-grey-300 cursor-not-allowed"
                        : isSelected
                          ? "bg-grey-600 text-white"
                          : "bg-grey-100 text-grey-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 영업시간 Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-grey-900">
                영업시간
              </label>
              <Checkbox
                checked={isUnknown}
                onChange={handleUnknownToggle}
                label="모름"
                variant="filled"
                size="small"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => !isUnknown && setIsOpenTimeModalOpen(true)}
                disabled={isUnknown}
                className={`flex-1 h-11 flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isUnknown ? "bg-grey-100 cursor-not-allowed" : "bg-grey-50 hover:bg-grey-100"
                }`}
              >
                <Clock size={24} className={isUnknown ? "stroke-grey-300" : "stroke-grey-500"} />
                <span
                  className={`flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                    isUnknown ? "text-grey-300" : "text-grey-500"
                  }`}
                >
                  {isUnknown ? "-" : openTime}
                </span>
              </button>
              <span
                className={`text-[16px] leading-[1.5] tracking-[-0.16px] ${isUnknown ? "text-grey-300" : "text-grey-900"}`}
              >
                ~
              </span>
              <button
                type="button"
                onClick={() => !isUnknown && setIsCloseTimeModalOpen(true)}
                disabled={isUnknown}
                className={`flex-1 h-11 flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isUnknown ? "bg-grey-100 cursor-not-allowed" : "bg-grey-50 hover:bg-grey-100"
                }`}
              >
                <Clock size={24} className={isUnknown ? "stroke-grey-300" : "stroke-grey-500"} />
                <span
                  className={`flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                    isUnknown ? "text-grey-300" : "text-grey-500"
                  }`}
                >
                  {isUnknown ? "-" : closeTime}
                </span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <Button variant="tertiary" size="medium" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1"
            >
              선택완료
            </Button>
          </div>
        </div>
      </div>

      {/* Time Picker Modals */}
      <TimePickerModal
        isOpen={isOpenTimeModalOpen}
        initialTime={openTime}
        onClose={() => setIsOpenTimeModalOpen(false)}
        onSelect={(time) => setOpenTime(time)}
      />
      <TimePickerModal
        isOpen={isCloseTimeModalOpen}
        initialTime={closeTime}
        onClose={() => setIsCloseTimeModalOpen(false)}
        onSelect={(time) => setCloseTime(time)}
      />
    </>
  );
}
