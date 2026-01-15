"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/mypage");
  };

  const handleTermsClick = () => {
    router.push("/mypage/terms/service");
  };

  const handleLicenseClick = () => {
    router.push("/mypage/terms/license");
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative pb-[70px]">
      {/* Header */}
      <header className="bg-white h-12 flex items-center pl-3 pr-5 py-2 gap-0">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-[27px] flex items-center">
          약관/라이센스
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col px-5 pt-[7px]">
        <div className="flex flex-col w-full">
          {/* 이용약관 */}
          <button
            onClick={handleTermsClick}
            className="flex items-center justify-between w-full px-0 py-3.5 border-b border-line-100"
          >
            <span className="flex-1 text-left text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900 h-6">
              이용약관
            </span>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                width="7"
                height="14"
                viewBox="0 0 7 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 13L6 7L1 1"
                  stroke="#626264"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {/* 라이센스 */}
          <button
            onClick={handleLicenseClick}
            className="flex items-center justify-between w-full px-0 py-3.5"
          >
            <span className="flex-1 text-left text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-900 h-6">
              라이센스
            </span>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                width="7"
                height="14"
                viewBox="0 0 7 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 13L6 7L1 1"
                  stroke="#626264"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
