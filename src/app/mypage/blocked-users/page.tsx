"use client";

import { useState } from "react";
import Image from "next/image";
import { useBlockUser } from "@/api/mutations/useBlockUser";
import { useUnblockUser } from "@/api/mutations/useUnblockUser";
import { useBlockedUsers } from "@/api/queries/useBlockedUsers";
import { BackHeader } from "@/components/common";
import { UnblockConfirmModal } from "@/components/mypage/UnblockConfirmModal";
import { useToast } from "@/hooks";

/**
 * 날짜 포맷: ISO 8601 -> YYYY.MM.DD
 */
function formatBlockedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export default function BlockedUsersPage() {
  const { showToast } = useToast();
  const { data, isLoading } = useBlockedUsers();
  const unblockMutation = useUnblockUser();
  const blockMutation = useBlockUser();

  const blockedUsers = data?.content ?? [];
  const totalCount = data?.totalCount ?? 0;

  // 차단 해제 확인 모달 상태
  const [unblockTarget, setUnblockTarget] = useState<{
    userId: number;
    nickname: string;
  } | null>(null);

  // 차단해제 버튼 클릭 -> 모달 열기
  const handleUnblockClick = (userId: number, nickname: string) => {
    setUnblockTarget({ userId, nickname });
  };

  // 모달에서 확인 클릭 -> 차단 해제 실행
  const handleConfirmUnblock = () => {
    if (!unblockTarget) return;

    const { userId, nickname } = unblockTarget;

    unblockMutation.mutate(userId, {
      onSuccess: () => {
        setUnblockTarget(null);
        showToast(`${nickname}님의 차단이 해제되었어요`, 3000, {
          label: "취소",
          onPress: () => {
            blockMutation.mutate(userId, {
              onError: (error) => {
                showToast(error.message || "차단 복원에 실패했어요.");
              },
            });
          },
        });
      },
      onError: (error) => {
        showToast(error.message || "차단 해제에 실패했어요.");
      },
    });
  };

  return (
    <div className="bg-default min-h-dvh flex flex-col">
      <BackHeader title="차단한 사용자 목록" />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          <Image src="/images/blocked-empty.png" alt="차단한 사용자 없음" width={96} height={87} />
          <p className="text-xl font-semibold text-grey-900 tracking-[-0.2px] leading-7">
            차단한 사용자가 없어요
          </p>
        </div>
      ) : (
        <div className="flex flex-col px-5 mt-4">
          <p className="text-sm font-normal text-grey-900 tracking-[-0.14px] leading-[21px] mb-2">
            총 {totalCount}개
          </p>
          <div className="flex flex-col gap-2">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex w-[345px] items-center gap-1.5 rounded-[10px] bg-grey-50 px-[18px] py-[14px]"
              >
                <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-grey-700 tracking-[-0.15px] leading-[22.5px] truncate">
                    {user.nickname}
                  </span>
                  <span className="text-xs font-normal text-grey-400 tracking-[-0.12px] leading-[18px]">
                    차단일시: {formatBlockedDate(user.blockedAt)}
                  </span>
                </div>
                <button
                  onClick={() => handleUnblockClick(user.id, user.nickname)}
                  disabled={unblockMutation.isPending}
                  className="shrink-0 rounded-full border border-grey-300 bg-white px-2 py-1 text-xs font-normal text-grey-700 tracking-[-0.12px] leading-[18px] disabled:opacity-50"
                >
                  차단해제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 차단 해제 확인 모달 */}
      <UnblockConfirmModal
        isOpen={!!unblockTarget}
        isLoading={unblockMutation.isPending}
        nickname={unblockTarget?.nickname ?? ""}
        onClose={() => setUnblockTarget(null)}
        onConfirm={handleConfirmUnblock}
      />
    </div>
  );
}
