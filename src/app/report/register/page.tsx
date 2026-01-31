"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Clock, Plus } from "lucide-react";
import { useCreateShopWithUpload } from "@/api/mutations/useCreateShopWithUpload";
import { BackHeader, Button, Checkbox } from "@/components/common";
import { Toast } from "@/components/common/Toast";
import { ExitConfirmModal } from "@/components/report/ExitConfirmModal";
import { OperatingHoursItem } from "@/components/report/OperatingHoursItem";
import { TimePickerModal } from "@/components/report/TimePickerModal";
import { OperatingHoursEntry } from "@/types/report";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;

function ReportRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    address: "",
    latitude: 0,
    longitude: 0,
    shopName: "",
    locationHint: "",
    images: [] as File[],
  });
  const [operatingHours, setOperatingHours] = useState<OperatingHoursEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 영업시간 입력 상태
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isEveryDay, setIsEveryDay] = useState(false);
  const [openTime, setOpenTime] = useState("오전 10:00");
  const [closeTime, setCloseTime] = useState("오후 10:00");
  const [isUnknown, setIsUnknown] = useState(false);
  const [is24Hours, setIs24Hours] = useState(false);
  const [isOpenTimeModalOpen, setIsOpenTimeModalOpen] = useState(false);
  const [isCloseTimeModalOpen, setIsCloseTimeModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 영업시간 기본값 설정: 매일, 시간 모름
  useEffect(() => {
    if (!isInitialized && operatingHours.length === 0) {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setIsEveryDay(true);
      setIsUnknown(true);
      setIsInitialized(true);
    }
  }, [isInitialized, operatingHours.length]);

  // URL 파라미터에서 주소와 좌표 가져오기
  useEffect(() => {
    const address = searchParams.get("address") || "";
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    const lat = latParam ? parseFloat(latParam) : NaN;
    const lng = lngParam ? parseFloat(lngParam) : NaN;

    // 좌표가 유효하지 않으면 이전 페이지로 리다이렉트
    if (!latParam || !lngParam || Number.isNaN(lat) || Number.isNaN(lng)) {
      router.replace("/report");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lng,
    }));
  }, [searchParams, router]);
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", isVisible: false });
  const [toastKey, setToastKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createShopWithUpload = useCreateShopWithUpload();

  // 토스트 재출현을 위한 헬퍼 함수
  const displayToast = (message: string) => {
    setToast({ message, isVisible: false });
    setTimeout(() => {
      setToastKey((prev) => prev + 1);
      setToast({ message, isVisible: true });
    }, 0);
  };

  const hasUserInput =
    Boolean(formData.shopName.trim()) ||
    Boolean(formData.locationHint.trim()) ||
    formData.images.length > 0 ||
    operatingHours.length > 0 ||
    selectedDays.length > 0;

  const handleBackClick = () => {
    if (hasUserInput) {
      setIsExitConfirmModalOpen(true);
    } else {
      router.push("/report");
    }
  };

  const handleConfirmExit = () => {
    setIsExitConfirmModalOpen(false);
    router.push("/report");
  };

  // 이미 선택된 모든 요일 목록
  const existingDays = operatingHours.flatMap((entry) => entry.days);

  // 선택 가능한 요일 (이미 등록된 요일 제외)
  const availableDays = [0, 1, 2, 3, 4, 5, 6].filter((day) => !existingDays.includes(day));

  // 요일 토글
  const handleDayToggle = (dayIndex: number) => {
    if (existingDays.includes(dayIndex)) return;

    setSelectedDays((prev) => {
      const next = prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex];
      setIsEveryDay(next.length === availableDays.length);
      return next;
    });
  };

  // 매일 체크박스 토글
  const handleEveryDayToggle = (checked: boolean) => {
    setIsEveryDay(checked);
    if (checked) {
      setSelectedDays(availableDays);
    } else {
      setSelectedDays([]);
    }
  };

  // 모름 체크박스 토글
  const handleUnknownToggle = (checked: boolean) => {
    setIsUnknown(checked);
    if (checked) {
      setIs24Hours(false);
    }
  };

  // 24시간 체크박스 토글
  const handle24HoursToggle = (checked: boolean) => {
    setIs24Hours(checked);
    if (checked) {
      setIsUnknown(false);
    }
  };

  // 영업시간 추가
  const handleAddOperatingHours = () => {
    if (selectedDays.length === 0) return;

    const entry: OperatingHoursEntry = {
      id: Date.now().toString(),
      days: [...selectedDays].sort((a, b) => a - b),
      openTime: is24Hours ? "00:00" : openTime,
      closeTime: is24Hours ? "24:00" : closeTime,
      isUnknown,
      is24Hours,
    };

    setOperatingHours((prev) => [...prev, entry]);

    // 입력 상태 초기화
    setSelectedDays([]);
    setIsEveryDay(false);
    setOpenTime("오전 10:00");
    setCloseTime("오후 10:00");
    setIsUnknown(false);
    setIs24Hours(false);
  };

  // 영업시간 삭제
  const handleDeleteOperatingHours = (id: string) => {
    setOperatingHours((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이전 프리뷰 URL 해제
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // 새 프리뷰 URL 생성
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFormData((prev) => ({
        ...prev,
        images: [file], // 대표 이미지 1개만
      }));
    }
    // 같은 파일 재업로드를 위해 input value 초기화
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    // 프리뷰 URL 해제
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormData((prev) => ({
      ...prev,
      images: [],
    }));
  };

  // 컴포넌트 언마운트 시 프리뷰 URL 해제
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isFormValid = Boolean(formData.shopName.trim()) && formData.images.length > 0;

  /**
   * 시간 포맷 변환: "오전 00:00" -> "00:00" (24시간 형식)
   */
  const convertTimeFormat = (timeStr: string): string => {
    const match = timeStr.match(/(오전|오후)\s(\d+):(\d+)/);
    if (!match) return "00:00";

    const period = match[1];
    let hour = parseInt(match[2]);
    const minute = match[3];

    if (period === "오후" && hour !== 12) {
      hour += 12;
    } else if (period === "오전" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}`;
  };

  /**
   * 영업 시간 데이터 변환
   * 백엔드 정책:
   * - 모든 요일의 key 존재 (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
   * - 영업 시간: "10:00~20:00" 형식
   * - "00:00~00:00" 금지 → null 사용
   * - 휴무: "휴무"
   * - 모름: null 또는 ""
   * - 아무것도 등록 안 함: 모든 요일 null
   */
  const convertOpenTime = (): Record<string, string | null> => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
    const openTimeRecord: Record<string, string | null> = {};

    // 모든 요일에 대해 기본값 설정
    dayNames.forEach((dayName, index) => {
      // 해당 요일이 등록된 entry 찾기
      const entry = operatingHours.find((e) => e.days.includes(index));

      if (!entry) {
        // 등록되지 않은 요일 = 아무것도 등록 안 한 경우 모름(null), 일부만 등록한 경우 휴무("휴무")
        openTimeRecord[dayName] = operatingHours.length === 0 ? null : "휴무";
      } else if (entry.isUnknown) {
        // 모름
        openTimeRecord[dayName] = null;
      } else if (entry.is24Hours) {
        // 24시간
        openTimeRecord[dayName] = "00:00~24:00";
      } else {
        const open = convertTimeFormat(entry.openTime);
        const close = convertTimeFormat(entry.closeTime);
        const timeValue = `${open}~${close}`;

        // "00:00~00:00"은 null로 처리
        if (timeValue === "00:00~00:00") {
          openTimeRecord[dayName] = null;
        } else {
          openTimeRecord[dayName] = timeValue;
        }
      }
    });

    return openTimeRecord;
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    // 영업시간이 추가되지 않은 경우 토스트 표시
    if (operatingHours.length === 0) {
      displayToast("영업시간을 추가해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const shopData = {
        name: formData.shopName,
        addressName:
          formData.address && formData.address.trim() !== "" ? formData.address : undefined,
        locationHint: formData.locationHint || undefined,
        openTime: convertOpenTime(),
      };
      const coordinate = {
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // 통합 훅 사용 - 파일 업로드 + 가게 생성을 한번에
      await createShopWithUpload.mutateAsync({
        file: formData.images[0],
        shopData,
        coordinate,
      });

      // 제보 완료 페이지로 이동
      router.push("/report/complete");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "업체 등록에 실패했어요.";
      displayToast(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative">
      {/* Header */}
      <BackHeader title="업체 정보 등록" onBack={handleBackClick} />

      {/* Main Content */}
      <main className="flex flex-col gap-7 pt-3 px-5">
        {/* 주소 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[2px]">
            <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
              주소
            </label>
            <span className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-main">
              *
            </span>
          </div>
          <div className="bg-grey-100 h-11 flex items-center px-3 py-2 rounded-lg">
            <p className="text-[15px] font-semibold leading-[1.5] tracking-[-0.15px] text-grey-400">
              {formData.address}
            </p>
          </div>
        </div>

        {/* 업체명 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[2px]">
            <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
              업체명
            </label>
            <span className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-main">
              *
            </span>
          </div>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
            placeholder="업체 이름을 작성해주세요"
            className="bg-grey-50 h-11 px-3 py-2 rounded-lg text-[15px] leading-[1.5] tracking-[-0.15px] placeholder:text-grey-500 text-grey-900 focus:outline-none focus:ring-2 focus:ring-main-400"
          />
        </div>

        {/* 위치 힌트 */}
        <div className="flex flex-col gap-2">
          <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
            위치 힌트
          </label>
          <input
            type="text"
            value={formData.locationHint}
            onChange={(e) => setFormData((prev) => ({ ...prev, locationHint: e.target.value }))}
            placeholder="예시) 지하 1층 베스킨라빈스 맞은편"
            className="bg-grey-50 min-h-11 px-3 py-2 rounded-lg text-[15px] leading-[1.5] tracking-[-0.15px] placeholder:text-grey-500 text-grey-900 focus:outline-none focus:ring-2 focus:ring-main-400"
          />
        </div>

        {/* 영업시간 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[2px]">
            <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
              영업시간
            </label>
            <span className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-main">
              *
            </span>
          </div>
          {/* 영업시간 입력 영역 - 모든 요일이 등록되지 않았을 때만 표시 */}
          {existingDays.length < 7 && (
            <div className="flex flex-col gap-4 p-4 bg-grey-50 rounded-lg">
              {/* 영업일 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-grey-900">
                    영업일
                  </span>
                </div>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const isDisabled = existingDays.includes(index);
                    const isSelected = selectedDays.includes(index);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        disabled={isDisabled}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-medium leading-[1.5] tracking-[-0.16px] transition-colors ${
                          isDisabled
                            ? "bg-grey-200 text-grey-300 cursor-not-allowed"
                            : isSelected
                              ? "bg-grey-600 text-white"
                              : "bg-white text-grey-400 border border-grey-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end pt-2">
                  <Checkbox
                    checked={isEveryDay}
                    onChange={handleEveryDayToggle}
                    label="매일"
                    variant="filled"
                    size="small"
                  />
                </div>
              </div>

              {/* 영업시간 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-grey-900">
                    시간
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => !isUnknown && !is24Hours && setIsOpenTimeModalOpen(true)}
                    disabled={isUnknown || is24Hours}
                    className={`flex-1 h-11 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isUnknown || is24Hours
                        ? "bg-grey-100 cursor-not-allowed"
                        : "bg-white hover:bg-grey-100"
                    }`}
                  >
                    <Clock
                      size={16}
                      className={isUnknown || is24Hours ? "stroke-grey-300" : "stroke-grey-500"}
                    />
                    <span
                      className={`flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                        isUnknown || is24Hours ? "text-grey-300" : "text-grey-600"
                      }`}
                    >
                      {isUnknown ? "-" : is24Hours ? "00:00" : openTime}
                    </span>
                  </button>
                  <span
                    className={`text-[14px] leading-[1.5] tracking-[-0.14px] ${isUnknown || is24Hours ? "text-grey-300" : "text-grey-600"}`}
                  >
                    ~
                  </span>
                  <button
                    type="button"
                    onClick={() => !isUnknown && !is24Hours && setIsCloseTimeModalOpen(true)}
                    disabled={isUnknown || is24Hours}
                    className={`flex-1 h-11 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isUnknown || is24Hours
                        ? "bg-grey-100 cursor-not-allowed"
                        : "bg-white hover:bg-grey-100"
                    }`}
                  >
                    <Clock
                      size={16}
                      className={isUnknown || is24Hours ? "stroke-grey-300" : "stroke-grey-500"}
                    />
                    <span
                      className={`flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] ${
                        isUnknown || is24Hours ? "text-grey-300" : "text-grey-600"
                      }`}
                    >
                      {isUnknown ? "-" : is24Hours ? "24:00" : closeTime}
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Checkbox
                    checked={is24Hours}
                    onChange={handle24HoursToggle}
                    label="24시간"
                    variant="filled"
                    size="small"
                  />
                  <Checkbox
                    checked={isUnknown}
                    onChange={handleUnknownToggle}
                    label="모름"
                    variant="filled"
                    size="small"
                  />
                </div>
              </div>

              {/* 추가 버튼 */}
              <button
                type="button"
                onClick={handleAddOperatingHours}
                disabled={selectedDays.length === 0}
                className={`flex items-center justify-center gap-1 h-10 rounded-lg transition-colors ${
                  selectedDays.length === 0
                    ? "bg-grey-200 text-grey-400 cursor-not-allowed"
                    : "bg-grey-600 text-white hover:bg-grey-700"
                }`}
              >
                <Plus size={18} />
                <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px]">
                  추가
                </span>
              </button>
            </div>
          )}

          {/* 영업시간 리스트 */}
          <div className="flex flex-col gap-2">
            {operatingHours.length === 0 ? (
              <div className="flex items-center bg-grey-50 rounded-lg px-5 py-4">
                <span className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-400">
                  영업시간 정보 없음 (+ 추가 버튼을 눌러주세요)
                </span>
              </div>
            ) : (
              operatingHours.map((entry) => (
                <OperatingHoursItem
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteOperatingHours}
                />
              ))
            )}
          </div>
        </div>

        {/* 업체 사진 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[2px]">
            <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
              대표 사진
            </label>
            <span className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-main">
              *
            </span>
          </div>
          {formData.images.length > 0 && previewUrl ? (
            <div className="relative w-[105px] h-[105px]">
              <img
                src={previewUrl}
                alt="대표 사진 미리보기"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-grey-600 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-[14px] font-bold">×</span>
              </button>
            </div>
          ) : (
            <label className="w-[105px] h-[105px] border border-dashed border-line-300 rounded-lg flex flex-col items-center justify-center gap-[5px] cursor-pointer hover:border-main-400 transition-colors">
              <Camera size={24} className="stroke-grey-600" />
              <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-grey-600 text-center">
                대표 사진을
                <br />
                업로드해주세요
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </main>

      {/* Submit Button */}
      <div className="sticky bottom-0 pt-3 pb-[52px] w-full max-w-[480px] px-5 bg-white">
        <Button
          variant="primary"
          size="medium"
          fullWidth
          disabled={!isFormValid}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          등록하기
        </Button>
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

      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        isOpen={isExitConfirmModalOpen}
        onClose={() => setIsExitConfirmModalOpen(false)}
        onConfirm={handleConfirmExit}
      />

      {/* Toast */}
      <Toast
        key={toastKey}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

export default function ReportRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto flex items-center justify-center">
          <p className="text-grey-600">로딩 중...</p>
        </div>
      }
    >
      <ReportRegisterContent />
    </Suspense>
  );
}
