"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Camera, Clock } from "lucide-react";
import { useCreateShopWithUpload } from "@/api/mutations/useCreateShopWithUpload";
import { Button } from "@/components/common";
import { Toast } from "@/components/common/Toast";
import { ExitConfirmModal } from "@/components/report/ExitConfirmModal";
import { TimePickerModal } from "@/components/report/TimePickerModal";

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
    openDays: [] as number[],
    openTime: "오전 12:00",
    closeTime: "오전 12:00",
    images: [] as File[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
  const [isOpenTimeModalOpen, setIsOpenTimeModalOpen] = useState(false);
  const [isCloseTimeModalOpen, setIsCloseTimeModalOpen] = useState(false);
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", isVisible: false });
  const [toastKey, setToastKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createShopWithUpload = useCreateShopWithUpload();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 리다이렉트 타이머 cleanup
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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
    formData.openDays.length > 0 ||
    formData.openTime !== "오전 12:00" ||
    formData.closeTime !== "오전 12:00";

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

  const handleDayToggle = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      openDays: prev.openDays.includes(dayIndex)
        ? prev.openDays.filter((d) => d !== dayIndex)
        : [...prev.openDays, dayIndex],
    }));
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
   * openDays 배열과 시간을 Record<string, string> 형태로 변환
   * 백엔드 스펙: {"mon": "10:00-22:00", "tue": "10:00-22:00", ...}
   * null 값은 제외하고 영업하는 날만 포함
   */
  const convertOpenTime = (): Record<string, string> | undefined => {
    if (formData.openDays.length === 0) return undefined;

    const dayNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const openTimeRecord: Record<string, string> = {};

    dayNames.forEach((dayName, index) => {
      if (formData.openDays.includes(index)) {
        const open = convertTimeFormat(formData.openTime);
        const close = convertTimeFormat(formData.closeTime);
        openTimeRecord[dayName] = `${open}-${close}`;
      }
    });

    return openTimeRecord;
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

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

      displayToast("업체 정보가 등록되었습니다.");
      redirectTimerRef.current = setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "업체 등록에 실패했습니다.";
      displayToast(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative pb-[120px]">
      {/* Header */}
      <header className="bg-white h-12 flex items-center px-5 py-2">
        <button onClick={handleBackClick} className="w-6 h-6 flex items-center justify-center">
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
          업체 정보 등록
        </h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </header>

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

        {/* 영업일 */}
        <div className="flex flex-col gap-2">
          <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
            영업일
          </label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <button
                key={day}
                onClick={() => handleDayToggle(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-medium leading-[1.5] tracking-[-0.16px] transition-colors ${
                  formData.openDays.includes(index)
                    ? "bg-grey-600 text-white"
                    : "bg-grey-100 text-grey-400"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 영업시간 */}
        <div className="flex flex-col gap-2">
          <label className="text-[18px] font-medium leading-[1.5] tracking-[-0.18px] text-grey-900">
            영업시간
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsOpenTimeModalOpen(true)}
              className="flex-1 bg-grey-50 h-11 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-grey-100 transition-colors"
            >
              <Clock size={24} className="stroke-grey-500" />
              <span className="flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-500">
                {formData.openTime}
              </span>
            </button>
            <span className="text-[16px] leading-[1.5] tracking-[-0.16px] text-grey-900">~</span>
            <button
              type="button"
              onClick={() => setIsCloseTimeModalOpen(true)}
              className="flex-1 bg-grey-50 h-11 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-grey-100 transition-colors"
            >
              <Clock size={24} className="stroke-grey-500" />
              <span className="flex-1 text-left text-[14px] leading-[1.5] tracking-[-0.14px] text-grey-500">
                {formData.closeTime}
              </span>
            </button>
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
      <div className="fixed bottom-[52px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5">
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
        initialTime={formData.openTime}
        onClose={() => setIsOpenTimeModalOpen(false)}
        onSelect={(time) => setFormData((prev) => ({ ...prev, openTime: time }))}
      />
      <TimePickerModal
        isOpen={isCloseTimeModalOpen}
        initialTime={formData.closeTime}
        onClose={() => setIsCloseTimeModalOpen(false)}
        onSelect={(time) => setFormData((prev) => ({ ...prev, closeTime: time }))}
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
