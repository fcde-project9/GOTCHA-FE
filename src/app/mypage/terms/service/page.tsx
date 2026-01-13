"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TERMS_OF_SERVICE } from "@/data/terms";

export default function TermsServicePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto">
      {/* Header */}
      <header className="bg-white h-12 flex items-center pl-3 pr-5 py-2 gap-0 sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-[27px] flex items-center">
          이용약관
        </h1>
      </header>

      {/* Content */}
      <main className="px-5 py-6">
        <article className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-[14px] leading-[1.8] tracking-[-0.14px] text-grey-800">
            {TERMS_OF_SERVICE.replace(/^# .+\n\n/, "")}
          </div>
        </article>
      </main>
    </div>
  );
}
