"use client";

import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/common";
import { OSS_NOTICE, LICENSE } from "@/data/terms";

export default function LicensePage() {
  const router = useRouter();

  return (
    <div className="bg-default h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-[480px] mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <BackHeader title="라이선스" onBack={() => router.push("/mypage/terms")} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-6 flex flex-col gap-3">
        {/* OSS Notice Section */}
        <div className="bg-grey-100 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-700">
            {OSS_NOTICE.title}
          </p>
          <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-700">
            {OSS_NOTICE.content}
            <a href={`mailto:${OSS_NOTICE.email}`} className="text-[#115bca] underline">
              {OSS_NOTICE.email}
            </a>
          </p>
        </div>

        {/* Lucide License Section */}
        <div className="bg-grey-50 rounded-lg p-4">
          <p className="whitespace-pre-wrap text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-700">
            {LICENSE}
          </p>
        </div>
      </main>
    </div>
  );
}
