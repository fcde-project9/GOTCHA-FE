"use client";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 로그아웃 확인 모달 컴포넌트
 */
export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-6">
        {/* Title */}
        <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
          로그아웃 하시겠습니까?
        </h2>

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
            className="flex-1 h-12 rounded-lg bg-grey-900 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
