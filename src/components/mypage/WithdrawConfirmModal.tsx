"use client";

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 회원탈퇴 최종 확인 모달 컴포넌트
 */
export function WithdrawConfirmModal({ isOpen, onClose, onConfirm }: WithdrawConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-6">
        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
            탈퇴하시겠습니까?
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700 text-center">
              탈퇴 버튼을 누르면 계정이{" "}
              <span className="text-main-500 font-semibold">영구 삭제</span>되어요
            </p>
            <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-500 text-center">
              * 서비스 활동 내역도 전부 삭제되어요
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-lg bg-main-500 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
