"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/mypage");
  };

  const handleTermsClick = () => {
    // TODO: 이용약관 페이지로 이동
    // router.push("/mypage/terms/service");
  };

  const handleLicenseClick = () => {
    // TODO: 라이센스 페이지로 이동
    // router.push("/mypage/terms/license");
  };

  return (
    <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto relative pb-[70px]">
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
              <ChevronRight size={14} className="stroke-grey-600" strokeWidth={1.5} />
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
              <ChevronRight size={14} className="stroke-grey-600" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
