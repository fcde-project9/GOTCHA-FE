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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-[335px] p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
            이 사용자를 차단하시겠어요?
          </h2>
          <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-700 text-center">
            {nickname}님의 모든 게시물을 보지 않게 돼요
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-lg bg-grey-100 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-700 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-lg bg-grey-900 text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-white disabled:opacity-50"
          >
            {isLoading ? "차단 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
