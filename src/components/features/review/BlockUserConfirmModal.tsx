"use client";

interface BlockUserConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  nickname: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 사용자 차단 확인 모달
 * 피그마: 차단/신고/계정 일시중지 및 정지 > 사용자 차단
 */
export function BlockUserConfirmModal({
  isOpen,
  isLoading = false,
  nickname,
  onClose,
  onConfirm,
}: BlockUserConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-[16px] w-[335px] px-4 py-5 flex flex-col gap-[22px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
            이 사용자를 차단하시겠어요?
          </h2>
          <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-600 text-center">
            {nickname}님의
            <br />
            모든 활동이 보이지 않게 돼요
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[46px] rounded-lg bg-grey-100 text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-grey-900 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-[46px] rounded-lg bg-main text-[17px] font-semibold leading-[1.5] tracking-[-0.17px] text-white disabled:opacity-50"
          >
            {isLoading ? "차단 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
