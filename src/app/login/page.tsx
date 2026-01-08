"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/common";
import { loginWithKakao, loginWithNaver, loginWithGoogle } from "@/utils";

export default function LoginPage() {
  const router = useRouter();
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGuestLogin = () => {
    setShowTermsSheet(true);
  };

  const handleTermsClick = () => {
    router.push("/terms");
  };

  const handleAgree = () => {
    if (!agreedToTerms) {
      return;
    }

    // 게스트 모드는 로컬 상태만 관리
    localStorage.setItem("user_type", "guest");
    localStorage.setItem("agreed_to_terms", "true");

    router.push("/home");
  };

  const handleCloseSheet = () => {
    setShowTermsSheet(false);
    setAgreedToTerms(false);
  };

  return (
    <>
      <div
        className={`relative flex min-h-screen w-full flex-col bg-default ${showTermsSheet ? "overflow-hidden" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-[480px] flex-col">
          {/* 로고 */}
          <div className="mt-[207px] flex justify-center">
            <Image
              src="/images/gotcha-logo.png"
              alt="GOTCHA 로고"
              width={130}
              height={90}
              priority
            />
          </div>

          {/* 소셜 로그인 버튼 영역 */}
          <div className="mt-[123px] flex flex-col gap-7 px-5">
            {/* 소셜 로그인 버튼 그룹 */}
            <div className="flex flex-col gap-3">
              {/* 카카오 로그인 */}
              <button
                onClick={loginWithKakao}
                disabled={showTermsSheet}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                <Image src="/images/kakao-logo.svg" alt="카카오" width={20} height={20} />
                <span className="text-[16px] font-semibold leading-[1.5] text-[rgba(0,0,0,0.85)]">
                  카카오 로그인
                </span>
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={loginWithNaver}
                disabled={showTermsSheet}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                <Image src="/images/naver-logo.svg" alt="네이버" width={20} height={20} />
                <span className="text-[16px] font-semibold leading-[1.5] text-white">
                  네이버 로그인
                </span>
              </button>

              {/* 구글 로그인 */}
              <button
                onClick={loginWithGoogle}
                disabled={showTermsSheet}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-grey-200 bg-white transition-colors hover:bg-grey-50 active:bg-grey-100 disabled:opacity-50"
              >
                <Image src="/images/google-logo.svg" alt="구글" width={20} height={20} />
                <span className="text-[16px] font-semibold leading-[1.5] text-[#1F1F1F]">
                  Google 로그인
                </span>
              </button>
            </div>

            {/* 게스트로 둘러보기 */}
            <button
              onClick={handleGuestLogin}
              disabled={showTermsSheet}
              className="pb-0.5 disabled:opacity-50"
            >
              <span className="border-b-[0.75px] border-grey-800 text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-800">
                게스트로 둘러보기
              </span>
            </button>
          </div>
        </div>

        {/* 오버레이 */}
        {showTermsSheet && (
          <div
            className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.8)] transition-opacity"
            onClick={handleCloseSheet}
          />
        )}

        {/* 바텀 시트 */}
        {showTermsSheet && (
          <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[480px]">
            <div className="flex flex-col gap-7 rounded-tl-[24px] rounded-tr-[24px] bg-white px-5 pb-[52px] pt-5">
              {/* 약관 동의 항목 */}
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={agreedToTerms}
                  onChange={setAgreedToTerms}
                  label="(필수) 이용약관 동의"
                  variant="outlined"
                />
                <button onClick={handleTermsClick}>
                  <ChevronRight size={24} className="stroke-grey-600" strokeWidth={2} />
                </button>
              </div>

              {/* 동의하고 계속하기 버튼 */}
              <button
                onClick={handleAgree}
                disabled={!agreedToTerms}
                className={`h-[46px] w-full rounded-lg text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-white transition-colors ${
                  agreedToTerms
                    ? "bg-grey-900 hover:bg-grey-800 active:bg-grey-700"
                    : "cursor-not-allowed bg-grey-300"
                }`}
              >
                동의하고 계속하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
