"use client";

interface ReportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 리뷰 신고 정상처리 다이얼로그
 * 피그마: 차단/신고/계정 일시중지 및 정지 > 리뷰 신고 정상처리
 */
export function ReportSuccessModal({ isOpen, onClose }: ReportSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
            신고가 정상적으로 처리되었어요
          </h2>
          <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500 text-center">
            * 신고 접수 후 조치까지 영업일 기준 3~5일 정도 소요
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-lg bg-grey-900 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
