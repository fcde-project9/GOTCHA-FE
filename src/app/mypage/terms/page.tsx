"use client";

import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/common";
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
      <BackHeader title="약관/라이센스" onBack={handleBack} />

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
