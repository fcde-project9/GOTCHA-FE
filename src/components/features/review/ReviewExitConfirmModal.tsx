"use client";

interface ReviewExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 리뷰 작성/수정 이탈 확인 모달 컴포넌트
 */
export function ReviewExitConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}: ReviewExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl w-[310px] p-4 flex flex-col gap-5">
        {/* Title */}
        <div className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center whitespace-pre-line">
          아직 작성중인 내용이 있어요{"\n"}나가면 작성한 내용이 사라져요
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-lg bg-grey-100 text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-lg bg-grey-900 text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-white"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
