"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { ERROR_IMAGES } from "@/constants/images";
import { openContactSupport } from "@/utils";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/home");
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* 404 메시지 영역 */}
        <div className="flex flex-1 flex-col items-center justify-center pb-[96px]">
          {/* 404 텍스트 */}
          <p className="text-center text-[79px] font-semibold leading-[1.5] tracking-[-0.79px] text-grey-900">
            404
          </p>

          {/* 텍스트 메시지 */}
          <div className="mt-2 flex flex-col items-center gap-2 text-center">
            <p className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
              요청한 페이지를 찾을 수 없어요
            </p>
            <p className="text-[14px] font-normal leading-[1.4] tracking-[-0.14px] text-grey-500">
              다시 시도해 주세요 문제가 지속될
              <br />
              경우 서비스 관리자에게 문의해 주세요
            </p>
          </div>

          {/* 멤버 이미지 */}
          <div className="mt-6">
            <Image src={ERROR_IMAGES.MEMBERS} alt="멤버 캐릭터" width={306} height={171} priority />
          </div>
        </div>

        {/* 버튼 그룹 - 바닥에서 52px 위 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px] gap-[9px]">
            <Button
              variant="tertiary"
              size="small"
              className="h-11 flex-1"
              onClick={openContactSupport}
            >
              문의하기
            </Button>
            <Button variant="primary" size="small" className="h-11 flex-1" onClick={handleGoHome}>
              홈으로 가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
