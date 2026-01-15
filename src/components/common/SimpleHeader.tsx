"use client";

import { ReactNode } from "react";

interface SimpleHeaderProps {
  /**
   * 헤더 타이틀
   */
  title: string;
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
 * 타이틀만 있는 심플 헤더 컴포넌트
 * 뒤로가기 버튼 없이 타이틀과 우측 액션 버튼만 표시
 * 찜한 업체, 마이페이지 등에서 사용
 *
 * @example
 * ```tsx
 * <SimpleHeader title="찜한 업체" />
 * <SimpleHeader title="마이" rightElement={<button><Headset /></button>} />
 * ```
 */
export function SimpleHeader({ title, rightElement, showBorder = false }: SimpleHeaderProps) {
  return (
    <header
      className={`shrink-0 flex h-14 items-center justify-between bg-default px-4 py-2 ${
        showBorder ? "border-b border-grey-100" : ""
      }`}
    >
      {/* 타이틀 */}
      <h1 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
        {title}
      </h1>

      {/* 우측 영역 */}
      {rightElement && <div className="flex items-center justify-center">{rightElement}</div>}
    </header>
  );
}
