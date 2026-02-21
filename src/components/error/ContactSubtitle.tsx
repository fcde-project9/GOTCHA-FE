"use client";

import { openContactSupport } from "@/utils";

/**
 * 에러 페이지 공통 서브타이틀
 *
 * "문제가 지속될 경우 서비스 관리자에게 문의해 주세요" 패턴을
 * 여러 에러 페이지에서 재사용합니다.
 */
export function ContactSubtitle() {
  return (
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
  );
}
