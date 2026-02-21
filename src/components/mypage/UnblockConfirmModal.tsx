"use client";

interface UnblockConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  nickname: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 차단 해제 확인 모달 컴포넌트
 * 닉네임이 길면 자동으로 truncate 됩니다.
 */
export function UnblockConfirmModal({
  isOpen,
  isLoading = false,
  nickname,
  onClose,
  onConfirm,
}: UnblockConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <div className="w-full max-w-[335px] rounded-2xl bg-white px-4 py-5 flex flex-col items-center gap-5">
        {/* Title & Description */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center max-w-[303px]">
            <span className="text-[18px] font-semibold text-main tracking-[-0.18px] leading-[27px] max-w-[114px] truncate shrink-0">
              {nickname}
            </span>
            <span className="text-[18px] font-semibold text-grey-900 tracking-[-0.18px] leading-[27px] whitespace-nowrap">
              님의 차단을 해제할까요?
            </span>
          </div>
          <p className="text-[14px] font-normal text-grey-700 tracking-[-0.14px] leading-[21px] text-center">
            차단을 해제하면 해당 사용자의
            <br />
            콘텐츠 및 활동이 다시 보여요
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-lg bg-grey-100 text-[16px] font-semibold text-grey-900 tracking-[-0.352px] leading-6 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-lg bg-main text-[16px] font-semibold text-white tracking-[-0.352px] leading-6 disabled:opacity-50"
          >
            {isLoading ? "해제 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
