"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OSS_NOTICE, LICENSE } from "@/data/terms";

export default function LicensePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto">
      {/* Header */}
      <header className="bg-white h-12 flex items-center px-5 py-2 sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[20px] font-semibold leading-[1.5] tracking-[-0.2px] text-grey-900">
          라이선스
        </h1>
      </header>

      {/* Content */}
      <main className="px-5 pt-[11px] pb-6 flex flex-col gap-2">
        {/* OSS Notice Section */}
        <div className="bg-grey-100 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-700">
            {OSS_NOTICE.title}
          </p>
          <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-700">
            {OSS_NOTICE.content}
            <a href={`mailto:${OSS_NOTICE.email}`} className="text-[#115bca] underline">
              {OSS_NOTICE.email}
            </a>
          </p>
        </div>

        {/* Lucide License Section */}
        <div className="bg-grey-50 rounded-lg p-4">
          <p className="whitespace-pre-wrap text-[12px] font-medium leading-[1.5] tracking-[-0.12px] text-grey-700">
            {LICENSE}
          </p>
        </div>
      </main>
    </div>
  );
}
