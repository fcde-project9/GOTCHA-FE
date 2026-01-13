"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface TermsLayoutProps {
  title: string;
  content: string;
}

export default function TermsLayout({ title, content }: TermsLayoutProps) {
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
          {title}
        </h1>
      </header>

      {/* Content */}
      <main className="px-5 pt-[11px] pb-6">
        <div className="bg-grey-50 rounded-lg p-4">
          <div className="whitespace-pre-wrap break-all text-[12px] leading-[1.5] tracking-[-0.12px] text-grey-700 font-medium">
            {content}
          </div>
        </div>
      </main>
    </div>
  );
}
