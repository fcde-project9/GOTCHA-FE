"use client";

import { BackHeader } from "@/components/common";

interface TermsLayoutProps {
  title: string;
  content: string;
}

export default function TermsLayout({ title, content }: TermsLayoutProps) {
  return (
    <div className="bg-default h-safe-viewport w-full max-w-[480px] mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <BackHeader title={title} />
      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <div className="bg-grey-50 rounded-lg p-4">
          <div className="whitespace-pre-wrap break-all text-[13px] leading-[1.5] tracking-[-0.13px] text-grey-700 font-normal">
            {content}
          </div>
        </div>
      </main>
    </div>
  );
}
