"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

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
      className={`relative flex h-screen w-full flex-col items-center justify-center bg-main transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
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
