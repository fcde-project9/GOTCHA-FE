"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LOGO_IMAGES } from "@/constants";

interface SplashScreenProps {
  /** 스플래시 표시 시간 (ms) */
  duration?: number;
  /** 스플래시 완료 콜백 */
  onComplete: () => void;
}

/**
 * 스플래시 스크린 컴포넌트
 * - 앱 첫 로딩 시 브랜드 로고 표시
 * - 페이드아웃 애니메이션 후 메인 콘텐츠로 전환
 * - 부모가 렌더링 여부를 제어 (sessionStorage 체크는 부모 책임)
 */
export function SplashScreen({ duration = 2000, onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const originalBgColor = document.documentElement.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#EF4444";

    const fadeDelay = Math.max(0, duration - 500);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      document.documentElement.style.backgroundColor = "#ffffff";
    }, fadeDelay);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      document.documentElement.style.backgroundColor = originalBgColor || "#ffffff";
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center pb-8 bg-main transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 로고 */}
      <div className="mb-8">
        <Image src={LOGO_IMAGES.LIGHT} alt="GOTCHA 로고" width={163} height={114} priority />
      </div>

      {/* 슬로건 */}
      <p className="text-center text-lg font-semibold tracking-tight text-white">
        가챠샵 정보를 한 곳에서 갓차!
      </p>
    </div>
  );
}
