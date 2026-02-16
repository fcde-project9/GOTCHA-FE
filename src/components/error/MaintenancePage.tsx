"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";

interface MaintenancePageProps {
  /** 점검 일시 텍스트 (예: "2026년 03월 25일 19:50~23:00") */
  schedule?: string;
}

/**
 * 시스템 점검 안내 페이지 컴포넌트
 *
 * 서버 점검 등으로 서비스 이용이 불가할 때 표시합니다.
 * Figma: 시스템 점검 안내
 */
export function MaintenancePage({ schedule }: MaintenancePageProps) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* 콘텐츠 영역 - 수직 중앙 정렬 */}
        <div className="flex flex-1 flex-col items-center justify-center pb-[96px]">
          <div className="flex flex-col items-center gap-6">
            {/* 일러스트 */}
            <Image
              src={ERROR_IMAGES.MAINTENANCE}
              alt="시스템 점검"
              width={80}
              height={86}
              priority
            />

            {/* 제목 + 설명 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
                시스템 점검 중
              </p>
              <p className="text-[14px] font-normal leading-[1.4] tracking-[-0.14px] text-grey-500">
                시스템 점검 중에는 앱 사용이
                <br />
                잠시 중단되니 양해를 부탁드립니다
              </p>
            </div>

            {/* 점검 일시 정보 */}
            {schedule && (
              <div className="flex w-[303px] flex-col gap-1 rounded-[10px] bg-grey-50 py-4 pl-6 pr-[10px] text-center">
                <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700">
                  점검 일시
                </p>
                <p className="text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-900">
                  {schedule}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 영역 - 하단 고정 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px]">
            <Button
              variant="primary"
              size="small"
              className="h-[46px] flex-1"
              onClick={() => router.push("/home")}
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
