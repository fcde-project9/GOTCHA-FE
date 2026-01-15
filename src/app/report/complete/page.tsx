"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { DEFAULT_IMAGES } from "@/constants";

export default function ReportCompletePage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/home");
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative flex flex-col">
      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7">
        <div className="relative w-[82px] h-[82px]">
          <Image
            src={DEFAULT_IMAGES.REPORT_COMPLETE}
            alt="제보 완료"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-black text-center">
          제보가 완료되었어요!
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-8">
        <Button variant="primary" size="large" fullWidth onClick={handleGoHome}>
          홈으로 가기
        </Button>
      </div>
    </div>
  );
}
