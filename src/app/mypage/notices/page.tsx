"use client";

import { BackHeader } from "@/components/common";

export default function NoticesPage() {
  return (
    <main className="h-safe-viewport overflow-hidden relative bg-default flex flex-col">
      <BackHeader title="공지사항" />

      <div className="flex flex-1 flex-col items-center justify-center px-5 -mt-14">
        <p className="text-center text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
          등록된 공지사항이 없어요.
        </p>
      </div>
    </main>
  );
}
