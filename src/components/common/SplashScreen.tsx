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
 * - sessionStorage로 세션 당 한 번만 표시
 */
export function SplashScreen({ duration = 2000, onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // 이미 스플래시를 본 경우 즉시 완료 처리
    const splashShown = sessionStorage.getItem("splashShown") === "true";
    if (splashShown) {
      setShouldShow(false);
      onComplete();
      return;
    }

    // 스플래시 화면일 때 html 배경색을 main으로 변경
    const originalBgColor = document.documentElement.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#EF4444";

    // 페이드아웃 시작 (duration - 500ms)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      document.documentElement.style.backgroundColor = "#ffffff";
    }, duration - 500);

    // 스플래시 완료
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      document.documentElement.style.backgroundColor = originalBgColor || "#ffffff";
    };
  }, [duration, onComplete]);

  // 이미 본 경우 렌더링하지 않음
  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-main transition-all duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 로고 */}
      <div className="mb-8">
        <Image src={LOGO_IMAGES.LIGHT} alt="GOTCHA 로고" width={163} height={114} priority />
      </div>

      {/* 슬로건 */}
      <p className="text-center text-lg font-semibold tracking-tight text-white">
        가챠샵 정보를 한곳에서 갓차!
      </p>
    </div>
  );
}
