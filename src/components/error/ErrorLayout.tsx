import { type ReactNode } from "react";

interface ErrorLayoutProps {
  /** 상단 일러스트 영역 */
  illustration: ReactNode;
  /** 제목 (ReactNode로 멀티라인 지원) */
  title: ReactNode;
  /** 설명 텍스트 */
  subtitle: ReactNode;
  /** 하단 버튼 영역 */
  buttons: ReactNode;
}

/**
 * 에러 페이지 공통 레이아웃
 *
 * Figma 에러 페이지 디자인 시스템의 공통 구조를 제공합니다.
 * 일러스트 → 제목/설명 → 하단 고정 버튼 레이아웃.
 */
export function ErrorLayout({ illustration, title, subtitle, buttons }: ErrorLayoutProps) {
  return (
    <div className="relative flex h-safe-viewport w-full overflow-hidden bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* 콘텐츠 영역 - 수직 중앙 정렬 */}
        <div className="flex flex-1 flex-col items-center justify-center pb-[96px]">
          {/* 일러스트 */}
          {illustration}

          {/* 제목 + 설명 */}
          <div className="mt-7 flex flex-col items-center gap-2 text-center">
            <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              {title}
            </p>
            <div className="text-[14px] font-normal leading-[1.4] tracking-[-0.14px] text-grey-500">
              {subtitle}
            </div>
          </div>
        </div>

        {/* 버튼 영역 - 하단 고정 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px] gap-[9px]">{buttons}</div>
        </div>
      </div>
    </div>
  );
}
