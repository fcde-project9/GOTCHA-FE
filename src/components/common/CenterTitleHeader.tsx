"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface CenterTitleHeaderProps {
  /**
   * 뒤로가기 클릭 시 실행할 함수 (미지정 시 router.back())
   */
  onBack?: () => void;
  /**
   * 헤더 타이틀 (중앙 정렬)
   */
  title: string;
  /**
   * 하단 테두리 표시 여부
   * @default false
   */
  showBorder?: boolean;
  /**
   * absolute 포지션 사용 여부 (지도 위 overlay 등)
   * @default false
   */
  absolute?: boolean;
}

/**
 * 중앙 정렬 타이틀이 있는 헤더 컴포넌트
 * 제보 페이지 등에서 사용
 *
 * @example
 * ```tsx
 * <CenterTitleHeader title="제보" />
 * <CenterTitleHeader title="업체 정보 등록" onBack={() => router.push('/home')} />
 * ```
 */
export function CenterTitleHeader({
  onBack,
  title,
  showBorder = false,
  absolute = false,
}: CenterTitleHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`flex h-14 items-center bg-white px-4 py-2 ${
        absolute ? "absolute top-0 left-0 right-0 z-10" : "shrink-0"
      } ${showBorder ? "border-b border-grey-100" : ""}`}
    >
      {/* 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center justify-center w-6"
        aria-label="뒤로가기"
      >
        <ChevronLeft size={24} strokeWidth={1.75} className="text-grey-800" />
      </button>

      {/* 중앙 타이틀 */}
      <h1 className="flex-1 text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
        {title}
      </h1>

      {/* 좌우 균형을 위한 빈 공간 */}
      <div className="w-6" />
    </header>
  );
}
