"use client";

import { ReactNode } from "react";

/**
 * 페이지 전환 enter 애니메이션 (iOS push 표준).
 *
 * - 새 페이지 mount 시 오른쪽에서 슬라이드 진입
 * - overflow-x-hidden은 데스크탑 뷰포트에서 480px 콘텐츠가 슬라이드 중
 *   양옆 여백으로 새지 않게 차단
 *
 * 한계:
 * - App Router는 이전 페이지가 즉시 unmount되어 exit 애니메이션 불가.
 *   디자이너 사양의 "오른쪽 슬라이드 사라지기"는 View Transitions API 또는
 *   framer-motion 도입이 필요한 별도 작업.
 * - forward/back 구분도 별도 작업 (현재는 둘 다 동일하게 enter 슬라이드).
 * - GNB 탭 전환 디졸브 구분도 별도 작업.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-hidden">
      <div className="animate-slide-in-right">{children}</div>
    </div>
  );
}
