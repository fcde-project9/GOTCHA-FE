"use client";

import { useRouter } from "next/navigation";
import { openInstagramSupport } from "@/utils";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/home");
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* 404 메시지 - 버튼 영역을 제외한 나머지 공간에서 가운데 정렬 */}
        <div className="flex flex-1 items-center justify-center pb-[96px]">
          <div className="flex flex-col items-center gap-7 px-5">
            <p className="text-center text-[70px] font-medium leading-[1.3] tracking-[-0.7px] text-grey-900">
              404
            </p>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
                요청한 페이지를 찾을 수 없습니다
              </p>
              <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
                서비스 관리자에게 문의해 주세요
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 - 바닥에서 52px 위 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px] gap-2.5">
            {/* 문의하기 버튼 */}
            <button
              onClick={openInstagramSupport}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-grey-100 transition-colors hover:bg-grey-200 active:bg-grey-300"
            >
              <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.352px] text-grey-900">
                문의하기
              </span>
            </button>

            {/* 홈으로 가기 버튼 */}
            <button
              onClick={handleGoHome}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-main transition-colors hover:bg-main-700 active:bg-main-900"
            >
              <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.352px] text-white">
                홈으로 가기
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
