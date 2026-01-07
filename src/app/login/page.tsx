"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOAuth } from "@/hooks/useOAuth";

export default function LoginPage() {
  const [fadeIn, setFadeIn] = useState(false);
  const router = useRouter();
  const { loginWithKakao, loginWithNaver, loginWithGoogle } = useOAuth();

  useEffect(() => {
    setFadeIn(true);

    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!);
    }
  }, []);

  const handleGuestLogin = () => {
    router.push("/map");
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-5 transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#FDFEFF" }}
    >
      {/* GOTCHA! 로고 */}
      <h1
        className="font-koulen text-[64px] leading-[150%] tracking-[-1.408px] mb-[216px]"
        style={{ color: "#121213" }}
      >
        GOTCHA!
      </h1>

      {/* 로그인 버튼 그룹 */}
      <div className="flex flex-col gap-3 w-full max-w-[335px]">
        {/* 카카오 로그인 */}
        <button
          onClick={loginWithKakao}
          className="flex h-12 items-center justify-center gap-2 rounded-lg font-semibold"
          style={{ backgroundColor: "#FEE500", color: "rgba(0, 0, 0, 0.85)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3.33334C5.95001 3.33334 2.66667 5.95834 2.66667 9.16668C2.66667 11.1583 3.85834 12.9083 5.71667 13.9667L4.95 16.9583C4.89167 17.175 5.14167 17.35 5.33334 17.2167L8.85834 14.7667C9.23334 14.8083 9.61667 14.8333 10 14.8333C14.05 14.8333 17.3333 12.2083 17.3333 9C17.3333 5.79167 14.05 3.33334 10 3.33334Z"
              fill="currentColor"
            />
          </svg>
          카카오 로그인
        </button>

        {/* 네이버 로그인 */}
        <button
          onClick={loginWithNaver}
          className="flex h-12 items-center justify-center gap-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#03C75A" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M13.6042 10.7917L6.04584 0H0V20H6.39584V9.20834L13.9542 20H20V0H13.6042V10.7917Z"
              fill="white"
            />
          </svg>
          네이버 로그인
        </button>

        {/* Google 로그인 */}
        <button
          onClick={loginWithGoogle}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#747775] bg-white font-semibold"
          style={{ color: "#1F1F1F" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M18.1712 8.36788H17.5V8.33329H10V11.6666H14.7096C14.0225 13.6071 12.1762 15 10 15C7.23875 15 5 12.7612 5 9.99996C5 7.23871 7.23875 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C5.39792 1.66663 1.66667 5.39788 1.66667 9.99996C1.66667 14.602 5.39792 18.3333 10 18.3333C14.6021 18.3333 18.3333 14.602 18.3333 9.99996C18.3333 9.44121 18.2758 8.89579 18.1712 8.36788Z"
              fill="#FFC107"
            />
            <path
              d="M2.6275 6.12121L5.36542 8.12913C6.10625 6.29496 7.90042 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C6.79917 1.66663 4.02333 3.47371 2.6275 6.12121Z"
              fill="#FF3D00"
            />
            <path
              d="M10 18.3333C12.1525 18.3333 14.1083 17.5095 15.5871 16.1712L13.0079 13.9879C12.1431 14.6315 11.0864 15 10 15C7.8325 15 5.99208 13.6179 5.29875 11.6891L2.58125 13.783C3.96042 16.4816 6.76125 18.3333 10 18.3333Z"
              fill="#4CAF50"
            />
            <path
              d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1704C15.4046 16.3371 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z"
              fill="#1976D2"
            />
          </svg>
          Google 로그인
        </button>
      </div>

      {/* 게스트로 둘러보기 */}
      <button
        onClick={handleGuestLogin}
        className="mt-7 border-b border-[#323233] text-sm text-[#323233]"
        style={{ letterSpacing: "-0.14px" }}
      >
        게스트로 둘러보기
      </button>
    </main>
  );
}
