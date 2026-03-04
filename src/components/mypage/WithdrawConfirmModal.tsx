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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-[16px] w-[335px] px-4 py-5 flex flex-col gap-[22px]">
        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
            탈퇴하시겠습니까?
          </h2>
          <div className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600 text-center">
            <p>
              탈퇴 버튼을 누르면 계정이 <span className="text-[#FF2115]">영구 삭제</span>돼요
            </p>
            <p>* 서비스 내 활동 내역도 전부 삭제돼요</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-[46px] rounded-lg bg-grey-100 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-900"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-[46px] rounded-lg bg-grey-900 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
