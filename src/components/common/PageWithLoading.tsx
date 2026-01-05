"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/common";

/**
 * 로딩 화면을 표시하는 클라이언트 컴포넌트
 * 2초 동안 로딩 화면을 보여준 후 children을 렌더링
 */
export default function PageWithLoading({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2초 후 로딩 완료
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
