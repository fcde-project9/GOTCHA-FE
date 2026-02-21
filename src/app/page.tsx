"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 루트 페이지 - /home으로 리디렉션
 *
 * 클라이언트 사이드 리디렉션 사용:
 * - Capacitor 정적 내보내기 호환
 * - 웹 환경에서도 정상 동작
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return null;
}
