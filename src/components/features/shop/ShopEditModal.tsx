"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Camera } from "lucide-react";
import { useUpdateShopMainImageWithUpload } from "@/api/mutations/useUpdateShopMainImageWithUpload";
import { useToast } from "@/hooks";
import type { OpenTime } from "@/types/api";

const DAY_LABELS: Record<keyof OpenTime, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

const ALL_DAYS: (keyof OpenTime)[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 영업시간 상태 타입
type DayStatusType = "custom" | "24h" | "closed" | "unknown";

const DAY_STATUS_OPTIONS: { value: DayStatusType; label: string }[] = [
  { value: "24h", label: "24시간" },
  { value: "unknown", label: "모름" },
];

interface ShopEditModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  shopId: number;
  shopData: {
    name: string;
    addressName: string;
    locationHint: string | null;
    openTime: string; // JSON string
    mainImageUrl: string | null;
  };
  onClose: () => void;
  onSave: (data: {
    name: string;
    addressName?: string;
    locationHint?: string;
    openTime?: Record<string, string | null>;
  }) => void;
}

function parseOpenTime(openTimeStr: string): OpenTime | null {
  try {
    return JSON.parse(openTimeStr) as OpenTime;
  } catch {
    return null;
  }
}

/**
 * 가게 정보 수정 모달 (ADMIN 전용)
 */
export function ShopEditModal({
  isOpen,
  isLoading = false,
  shopId,
  shopData,
  onClose,
  onSave,
}: ShopEditModalProps) {
  const { showToast } = useToast();
  const updateMainImageMutation = useUpdateShopMainImageWithUpload();

  const [name, setName] = useState(shopData.name);
  const [addressName, setAddressName] = useState(shopData.addressName);
  const [locationHint, setLocationHint] = useState(shopData.locationHint || "");
  const [openTimeValues, setOpenTimeValues] = useState<Record<string, string>>({});
  const [dayStatus, setDayStatus] = useState<Record<string, DayStatusType>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(shopData.mainImageUrl);

  // shopData 변경 시 상태 초기화
  useEffect(() => {
    setName(shopData.name);
    setAddressName(shopData.addressName);
    setLocationHint(shopData.locationHint || "");
    setPreviewImageUrl(shopData.mainImageUrl);

    const parsed = parseOpenTime(shopData.openTime);
    if (parsed) {
      const values: Record<string, string> = {};
      const statuses: Record<string, DayStatusType> = {};
      ALL_DAYS.forEach((day) => {
        const value = parsed[day];
        if (value === "00:00~24:00" || value === "24시간") {
          values[day] = "";
          statuses[day] = "24h";
        } else if (value === null) {
          // null은 "모름"으로 처리
          values[day] = "";
          statuses[day] = "unknown";
        } else if (value === "" || value === "휴무" || value === "모름") {
          values[day] = "";
          statuses[day] = "custom";
        } else {
          values[day] = value;
          statuses[day] = "custom";
        }
      });
      setOpenTimeValues(values);
      setDayStatus(statuses);
    }
  }, [shopData]);

  if (!isOpen) return null;

  const handleImageChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 미리보기 URL 생성
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);

      // 이미지 업로드
      try {
        await updateMainImageMutation.mutateAsync({ shopId, file });
        showToast("대표 이미지가 변경되었어요.");
      } catch {
        // 실패 시 원래 이미지로 복원
        setPreviewImageUrl(shopData.mainImageUrl);
        showToast("이미지 업로드에 실패했어요.");
      }
    };
    input.click();
  };

  const handleOpenTimeChange = (day: string, value: string) => {
    // 직접 입력하면 custom 상태로 변경
    setDayStatus((prev) => ({ ...prev, [day]: "custom" }));
    setOpenTimeValues((prev) => ({ ...prev, [day]: value }));
  };

  const handleDayStatusChange = (day: string, status: DayStatusType) => {
    setDayStatus((prev) => {
      const currentStatus = prev[day];
      // 같은 버튼을 다시 누르면 custom으로 돌아감
      if (currentStatus === status) {
        return { ...prev, [day]: "custom" };
      }
      return { ...prev, [day]: status };
    });
    // custom이 아닌 상태 선택 시 입력값 초기화
    if (status !== "custom") {
      setOpenTimeValues((prev) => ({ ...prev, [day]: "" }));
    }
  };

  const handleSave = () => {
    // name은 필수, 나머지는 변경된 값만 전송
    const updates: {
      name: string;
      addressName?: string;
      locationHint?: string;
      openTime?: Record<string, string | null>;
    } = {
      name, // 항상 포함
    };

    if (addressName !== shopData.addressName) {
      updates.addressName = addressName;
    }
    if (locationHint !== (shopData.locationHint || "")) {
      updates.locationHint = locationHint;
    }

    // openTime 변경 확인 (가게 생성 시와 동일한 형식으로 저장)
    const newOpenTime: Record<string, string | null> = {};
    ALL_DAYS.forEach((day) => {
      const status = dayStatus[day];
      switch (status) {
        case "24h":
          newOpenTime[day] = "00:00~24:00";
          break;
        case "unknown":
          newOpenTime[day] = null;
          break;
        default:
          // 입력값이 없으면 null (모름과 동일하게 처리)
          newOpenTime[day] = openTimeValues[day] || null;
      }
    });
    updates.openTime = newOpenTime;

    onSave(updates);
  };

  const isButtonDisabled = !name.trim() || !addressName.trim() || isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-[335px] max-h-[90vh] flex flex-col">
        {/* Header - 고정 */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            가게 정보 수정
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-6 h-6 flex items-center justify-center disabled:opacity-50"
            aria-label="닫기"
          >
            <X size={24} className="stroke-grey-700" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* 대표 이미지 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-grey-700">대표 이미지</label>
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-grey-100">
              {previewImageUrl ? (
                <Image src={previewImageUrl} alt="대표 이미지" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[14px] text-grey-400">이미지 없음</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleImageChange}
                disabled={isLoading || updateMainImageMutation.isPending}
                className="absolute bottom-2 right-2 w-8 h-8 bg-grey-900 bg-opacity-70 rounded-full flex items-center justify-center disabled:opacity-50"
                aria-label="이미지 변경"
              >
                {updateMainImageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* 가게명 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-grey-700">가게명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="h-12 px-4 rounded-lg border border-line-100 text-[14px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-grey-400 disabled:bg-grey-50"
            />
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-grey-700">주소</label>
            <input
              type="text"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              disabled={isLoading}
              className="h-12 px-4 rounded-lg border border-line-100 text-[14px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-grey-400 disabled:bg-grey-50"
            />
          </div>

          {/* 위치 힌트 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-grey-700">위치 힌트</label>
            <input
              type="text"
              value={locationHint}
              onChange={(e) => setLocationHint(e.target.value)}
              placeholder="예: 지하 1층 감성교복 앞"
              disabled={isLoading}
              className="h-12 px-4 rounded-lg border border-line-100 text-[14px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-grey-400 disabled:bg-grey-50"
            />
          </div>

          {/* 영업시간 */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-grey-700">영업시간</label>
            <div className="flex flex-col gap-2">
              {ALL_DAYS.map((day) => {
                const status = dayStatus[day] || "custom";
                const displayValue =
                  status === "24h"
                    ? "00:00~24:00"
                    : status === "unknown"
                      ? "-"
                      : openTimeValues[day] || "";
                return (
                  <div key={day} className="flex items-center gap-1.5">
                    <span className="w-5 text-[13px] text-grey-700 font-medium shrink-0">
                      {DAY_LABELS[day]}
                    </span>
                    <input
                      type="text"
                      value={displayValue}
                      onChange={(e) => handleOpenTimeChange(day, e.target.value)}
                      placeholder="10:00~22:00"
                      disabled={isLoading}
                      className="flex-1 min-w-0 h-9 px-2 rounded-lg border border-line-100 text-[13px] text-grey-900 placeholder:text-grey-400 focus:outline-none focus:border-grey-400 disabled:bg-grey-100 disabled:text-grey-400"
                    />
                    {DAY_STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDayStatusChange(day, option.value)}
                        disabled={isLoading}
                        className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 ${
                          status === option.value
                            ? "bg-grey-700 text-white"
                            : "bg-grey-100 text-grey-500"
                        } disabled:opacity-50`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons - 고정 */}
        <div className="flex gap-2 p-6 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isButtonDisabled}
            className="flex-1 h-12 rounded-lg bg-grey-900 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white disabled:bg-grey-300 disabled:text-grey-500"
          >
            {isLoading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
