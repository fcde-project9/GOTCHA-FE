"use client";

import { ModalShell } from "@/components/common/ModalShell";

interface ReportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 리뷰 신고 정상처리 다이얼로그
 * 피그마: 차단/신고/계정 일시중지 및 정지 > 리뷰 신고 정상처리
 */
export function ReportSuccessModal({ isOpen, onClose }: ReportSuccessModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[16px] w-[335px] px-4 py-5 flex flex-col gap-[22px]">
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
            신고가 정상적으로 접수되었어요
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600">
              깨끗한 GOTCHA! 환경을 위해
              <br />
              내부에서 검토 후 처리 예정이에요
            </p>
            <p className="text-[13px] font-normal leading-[1.5] tracking-[-0.13px] text-grey-400">
              * 신고 접수 후 조치까지 영업일 기준 3~5일 정도 소요
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-[44px] rounded-lg bg-main-400 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white"
        >
          확인
        </button>
      </div>
    </ModalShell>
  );
}
