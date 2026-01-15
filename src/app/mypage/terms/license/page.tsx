"use client";

import { BackHeader } from "@/components/common";
import { OSS_NOTICE, LICENSE } from "@/data/terms";

export default function LicensePage() {
  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto">
      {/* Header */}
      <BackHeader title="라이선스" sticky />

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
