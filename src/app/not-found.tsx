"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { openContactSupport } from "@/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* 404 메시지 영역 */}
        <div className="flex flex-1 flex-col items-center justify-center pb-[96px]">
          {/* 404 일러스트 */}
          <div>
            <Image src={ERROR_IMAGES.NOT_FOUND} alt="404" width={195} height={80} priority />
          </div>

          {/* 텍스트 메시지 */}
          <div className="mt-7 flex flex-col items-center gap-2 text-center">
            <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              페이지를 찾을 수 없어요
            </p>
            <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
              문제가 지속될 경우
              <br />
              서비스 관리자에게{" "}
              <button
                type="button"
                onClick={openContactSupport}
                className="font-semibold text-[#2A7FFF] underline"
              >
                문의
              </button>
              해 주세요
            </p>
          </div>
        </div>

        {/* 버튼 그룹 - 바닥에서 52px 위 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px] gap-[9px]">
            <Button
              variant="tertiary"
              size="small"
              className="h-11 flex-1"
              onClick={() => router.back()}
            >
              이전 페이지
            </Button>
            <Button
              variant="primary"
              size="small"
              className="h-11 flex-1"
              onClick={() => router.push("/home")}
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
