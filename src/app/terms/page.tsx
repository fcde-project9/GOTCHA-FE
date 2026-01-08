"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TERMS_OF_SERVICE } from "@/data/terms";

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-default">
      <div className="mx-auto flex w-full max-w-[480px] flex-col">
        {/* 헤더 */}
        <header className="flex h-12 items-center gap-2 px-5 py-2">
          <button onClick={handleBack} className="flex items-center justify-center">
            <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            이용약관
          </h1>
        </header>

        {/* 이용약관 내용 */}
        <main className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
          <div className="rounded-lg bg-grey-50 p-5">
            <div className="whitespace-pre-wrap text-[14px] font-normal leading-[1.7] tracking-[-0.14px] text-grey-900">
              {TERMS_OF_SERVICE}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
