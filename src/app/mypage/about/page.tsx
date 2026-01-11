"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function AboutPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/mypage");
  };

  const handleInstagramClick = () => {
    // TODO: 인스타그램 계정 연동
    // window.open("https://instagram.com/gatcha_map", "_blank");
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative pb-[70px]">
      {/* Header */}
      <header className="bg-default h-12 flex items-center pl-3 pr-5 py-2 gap-0">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-6 flex items-center">
          이 앱을 만든 녀석들
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-5 pt-[51px] relative">
        {/* Speech Bubble */}
        <div className="relative mb-6 flex flex-col items-center">
          <div className="relative w-[207px] h-[110px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="207"
              height="110"
              viewBox="0 0 207 110"
              fill="none"
            >
              <mask id="path-1-inside-1_1109_11367" fill="white">
                <path d="M103.5 0C160.661 0 207 20.8358 207 46.5381C207 70.813 165.666 90.7434 112.918 92.8828L103.5 110L94.0811 92.8828C41.3338 90.7432 0 70.8129 0 46.5381C0.000449327 20.8358 46.3388 0 103.5 0Z" />
              </mask>
              <path
                d="M207 46.5381H208V46.5381L207 46.5381ZM112.918 92.8828L112.877 91.8836L112.314 91.9065L112.042 92.4008L112.918 92.8828ZM103.5 110L102.624 110.482L103.5 112.074L104.376 110.482L103.5 110ZM94.0811 92.8828L94.9572 92.4007L94.6852 91.9065L94.1216 91.8836L94.0811 92.8828ZM0 46.5381L-1 46.5381V46.5381H0ZM103.5 0V1C131.973 1 157.702 6.19131 176.275 14.5427C194.943 22.9365 206 34.326 206 46.5381L207 46.5381L208 46.5381C208 33.0479 195.887 21.1684 177.095 12.7186C158.209 4.22658 132.188 -1 103.5 -1V0ZM207 46.5381H206C206 58.0685 196.148 68.8671 179.3 77.1131C162.527 85.3219 139.15 90.818 112.877 91.8836L112.918 92.8828L112.958 93.882C139.434 92.8082 163.098 87.2694 180.179 78.9095C197.184 70.5867 208 59.2826 208 46.5381H207ZM112.918 92.8828L112.042 92.4008L102.624 109.518L103.5 110L104.376 110.482L113.794 93.3649L112.918 92.8828ZM103.5 110L104.376 109.518L94.9572 92.4007L94.0811 92.8828L93.2049 93.3649L102.624 110.482L103.5 110ZM94.0811 92.8828L94.1216 91.8836C67.8491 90.8179 44.4725 85.3218 27.6999 77.1129C10.8515 68.8669 1 58.0685 1 46.5381H0H-1C-1 59.2825 9.81543 70.5866 26.8207 78.9093C43.9018 87.2692 67.5657 92.8081 94.0405 93.882L94.0811 92.8828ZM0 46.5381L1 46.5381C1.00021 34.326 12.0573 22.9365 30.7248 14.5427C49.2982 6.19131 75.0272 1 103.5 1V0V-1C74.8116 -1 48.7908 4.22658 29.9046 12.7186C11.1126 21.1684 -0.999764 33.0479 -1 46.5381L0 46.5381Z"
                fill="black"
                mask="url(#path-1-inside-1_1109_11367)"
              />
            </svg>
            <div className="absolute inset-0 flex items-start justify-center pt-8">
              <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-800 border-b border-grey-900">
                우리 인스타 한번 볼래요?
              </p>
            </div>
          </div>
        </div>

        {/* Team Members Image */}
        <div className="relative w-full max-w-[375px] h-[380px] flex items-center justify-center mb-8">
          <div className="relative w-[280px] h-[380px]">
            <Image
              src="/images/members.jpg"
              alt="팀 멤버들"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Instagram Account */}
        <button
          onClick={handleInstagramClick}
          className="text-[16px] font-medium leading-[2] tracking-[-0.16px] text-grey-900"
        >
          @gatcha_map
        </button>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
