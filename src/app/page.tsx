"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  // 스플래시 화면일 때 html 배경색을 main으로, fadeOut 시 흰색으로 변경
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#EF4444"; // main color

    return () => {
      document.documentElement.style.backgroundColor = "#ffffff";
    };
  }, []);

  // fadeOut 시작 시 배경색을 흰색으로 변경
  useEffect(() => {
    if (fadeOut) {
      document.documentElement.style.backgroundColor = "#ffffff";
    }
  }, [fadeOut]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    const navigateTimer = setTimeout(() => {
      router.push("/login");
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-main transition-all duration-500 ${
        fadeOut ? "opacity-0 bg-white" : "opacity-100"
      }`}
    >
      {/* 로고 */}
      <div className="mb-8">
        <Image
          src="/images/gotcha-logo-light.png"
          alt="GOTCHA 로고"
          width={163}
          height={114}
          priority
        />
      </div>

      {/* 슬로건 */}
      <p className="text-center text-lg font-semibold tracking-tight text-white">
        가챠샵 정보를 한곳에서 갓차!
      </p>
    </div>
  );
}
