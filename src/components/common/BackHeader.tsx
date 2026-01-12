"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackHeaderProps {
  /**
   * 뒤로가기 클릭 시 실행할 함수 (미지정 시 router.back())
   */
  onBack?: () => void;
  /**
   * 헤더 타이틀
   */
  title?: string;
  /**
   * 우측 영역에 렌더링할 요소
   */
  rightElement?: ReactNode;
  /**
   * 하단 테두리 표시 여부
   * @default false
   */
  showBorder?: boolean;
}

/**
 * 뒤로가기 버튼이 있는 공통 헤더 컴포넌트
 *
 * @example
 * ```tsx
 * <BackHeader />
 * <BackHeader title="업체 상세정보" />
 * <BackHeader showBorder />
 * <BackHeader rightElement={<button>저장</button>} />
 * ```
 */
export function BackHeader({ onBack, title, rightElement, showBorder = false }: BackHeaderProps) {
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
      className={`shrink-0 flex h-12 items-center justify-between bg-default px-4 ${
        showBorder ? "border-b border-grey-100" : ""
      }`}
    >
      {/* 뒤로가기 버튼 & 타이틀 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="text-grey-800" />
        </button>
        {title && <span className="text-[16px] font-medium text-grey-900">{title}</span>}
      </div>

      {/* 우측 영역 */}
      {rightElement && (
        <div className="w-10 h-10 flex items-center justify-center -mr-2">{rightElement}</div>
      )}
    </header>
  );
}
