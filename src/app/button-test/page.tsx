"use client";

import { notFound } from "next/navigation";
import { ButtonExamples } from "@/components/common/Button.example";

/**
 * Button 컴포넌트 테스트 페이지
 *
 * 개발 중에 /button-test 경로로 접속하여 버튼 컴포넌트를 확인할 수 있습니다.
 * 프로덕션 환경에서는 접근이 차단됩니다.
 */
export default function ButtonTestPage() {
  // 프로덕션 환경에서는 404 반환
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ButtonExamples />;
}
