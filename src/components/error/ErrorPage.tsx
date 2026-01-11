"use client";

import { useRouter } from "next/navigation";

interface ErrorPageProps {
  onRetry?: () => void;
}

/**
 * 일시적 에러 페이지 컴포넌트
 * 네트워크 오류나 5xx 서버 오류 등 재시도 가능한 에러를 표시합니다.
 */
export function ErrorPage({ onRetry }: ErrorPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-default">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col">
        {/* Error 메시지 - 버튼 영역을 제외한 나머지 공간에서 가운데 정렬 */}
        <div className="flex flex-1 items-center justify-center pb-[96px]">
          <div className="flex flex-col items-center gap-7 px-5">
            <p className="text-center text-[70px] font-medium leading-[1.3] tracking-[-0.7px] text-grey-900">
              Error
            </p>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
                일시적인 문제가 발생했습니다
              </p>
              <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
                다시 시도해 주세요 문제가 지속될
                <br />
                경우 서비스 관리자에게 문의해 주세요
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 - 바닥에서 52px 위 */}
        <div className="absolute bottom-[52px] left-0 right-0 flex justify-center px-5">
          <div className="flex w-full max-w-[335px] gap-2.5">
            {/* 돌아가기 버튼 */}
            <button
              onClick={handleBack}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-grey-100 transition-colors hover:bg-grey-200 active:bg-grey-300"
            >
              <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.352px] text-grey-900">
                돌아가기
              </span>
            </button>

            {/* 다시 시도 버튼 */}
            <button
              onClick={onRetry}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-main transition-colors hover:bg-main-700 active:bg-main-900"
            >
              <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.352px] text-white">
                다시 시도
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
