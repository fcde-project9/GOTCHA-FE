"use client";

import { BackHeader } from "@/components/common";

interface TermsLayoutProps {
  title: string;
  content: string;
}

export default function TermsLayout({ title, content }: TermsLayoutProps) {
  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto">
      {/* Header */}
      <BackHeader title={title} sticky />
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
