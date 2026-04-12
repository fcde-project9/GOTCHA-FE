"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Headset } from "lucide-react";
import { useLogout } from "@/api/mutations/useLogout";
import { useUpdateNickname } from "@/api/mutations/useUpdateNickname";
import { useUpdateProfileImageWithUpload } from "@/api/mutations/useUpdateProfileImageWithUpload";
import { useWithdraw } from "@/api/mutations/useWithdraw";
import { useUser } from "@/api/queries/useUser";
import type { User } from "@/api/types";
import { SimpleHeader } from "@/components/common";
import Footer from "@/components/common/Footer";
import { ErrorPage } from "@/components/error/ErrorPage";
import { LogoutModal } from "@/components/mypage/LogoutModal";
import { MenuList } from "@/components/mypage/MenuList";
import { NicknameModal } from "@/components/mypage/NicknameModal";
import { ProfileSection } from "@/components/mypage/ProfileSection";
import { WithdrawConfirmModal } from "@/components/mypage/WithdrawConfirmModal";
import { WithdrawModal } from "@/components/mypage/WithdrawModal";
import { useToast, useAuth } from "@/hooks";
import { openContactSupport, compressShopImage } from "@/utils";

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const { data: user, isLoading: userLoading, error, refetch, isAdmin } = useUser();
  const updateNicknameMutation = useUpdateNickname();
  const updateProfileImageWithUploadMutation = useUpdateProfileImageWithUpload();
  const logoutMutation = useLogout();
  const withdrawMutation = useWithdraw();

  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawConfirmModalOpen, setIsWithdrawConfirmModalOpen] = useState(false);
  const [withdrawReasons, setWithdrawReasons] = useState<string[]>([]);
  const [withdrawOtherReason, setWithdrawOtherReason] = useState<string>();

  const handleEditProfile = async (file: File) => {
    try {
      const compressed = await compressShopImage(file);
      await updateProfileImageWithUploadMutation.mutateAsync(compressed);
      showToast("프로필 이미지가 변경되었어요");
    } catch {
      showToast("프로필 이미지 변경에 실패했어요", { variant: "warning" });
    }
  };

  const handleEditNickname = () => {
    setIsNicknameModalOpen(true);
  };

  const handleSaveNickname = async (newNickname: string) => {
    try {
      await updateNicknameMutation.mutateAsync(newNickname);
      showToast("닉네임이 변경되었어요!");
    } catch (error) {
      // 에러를 다시 throw하여 NicknameModal에서 처리하도록 함
      throw error;
    }
  };

  const handleFavorites = () => {
    router.push("/favorites");
  };

  const handleMyReports = () => {
    router.push("/mypage/my-reports");
  };

  const handleBlockedUsers = () => {
    router.push("/mypage/blocked-users");
  };

  const handleTerms = () => {
    router.push("/mypage/terms");
  };

  const handleAbout = () => {
    router.push("/mypage/about");
  };

  const handleSupport = () => {
    openContactSupport();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // 로그아웃 API 호출
      await logoutMutation.mutateAsync();
    } catch {
      // API 실패 시에도 로컬 데이터는 정리
    } finally {
      // useAuth의 logout으로 토큰 정리 및 상태 업데이트
      logout();

      // 세션 스토리지 정리
      sessionStorage.clear();

      // 쿠키 정리 (HttpOnly 쿠키는 서버에서 처리, 클라이언트 쿠키는 여기서 제거)
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // React Query 캐시 정리
      queryClient.clear();

      setIsLogoutModalOpen(false);
      showToast("로그아웃 되었어요");
      router.push("/");
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = (reasons: string[], otherReason?: string) => {
    setWithdrawReasons(reasons);
    setWithdrawOtherReason(otherReason);
    setIsWithdrawConfirmModalOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    try {
      // 회원탈퇴 API 호출
      await withdrawMutation.mutateAsync({
        reasons: withdrawReasons,
        detail: withdrawOtherReason,
      });

      // useAuth의 logout으로 토큰 정리 및 상태 업데이트
      logout();

      // 약관 동의 정보 삭제 (재가입 시 동의 화면 표시를 위해)
      localStorage.removeItem("agreed_to_terms");

      // 세션 스토리지 정리
      sessionStorage.clear();

      // 쿠키 정리 (HttpOnly 쿠키는 서버에서 처리, 클라이언트 쿠키는 여기서 제거)
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // React Query 캐시 정리
      queryClient.clear();

      // 회원탈퇴 관련 상태 초기화
      setWithdrawReasons([]);
      setWithdrawOtherReason(undefined);

      // 모달 닫기 및 홈으로 이동
      setIsWithdrawModalOpen(false);
      setIsWithdrawConfirmModalOpen(false);
      showToast("회원탈퇴가 완료되었어요");
      router.push("/");
    } catch {
      showToast("회원탈퇴에 실패했어요. 다시 시도해주세요.", { variant: "warning" });
    }
  };

  // 로딩 중이면 빈 화면 표시
  const isLoading = authLoading || userLoading;
  if (isLoading) {
    return (
      <>
        <main className="h-[calc(100dvh-env(safe-area-inset-top,0px)-var(--footer-height))] w-full max-w-[480px] mx-auto bg-default flex flex-col">
          <SimpleHeader title="마이페이지" />
        </main>
        <Footer />
      </>
    );
  }

  // 일시적 에러 확인 (네트워크 오류 또는 5xx 서버 오류)
  // 401은 providers.tsx와 apiClient에서 전역 처리됨
  const axiosError = error as { response?: { status?: number } } | null;
  const isTemporaryError =
    error &&
    axiosError?.response?.status !== 401 &&
    (!axiosError?.response ||
      (axiosError.response.status !== undefined && axiosError.response.status >= 500));

  // 일시적 에러 시 재시도 UI 표시
  if (isTemporaryError) {
    return <ErrorPage onRetry={refetch} />;
  }

  // useAuth의 isLoggedIn으로 로그인 여부 판별 (null도 undefined로 처리)
  const loggedInUser: User | undefined = isLoggedIn && user ? user : undefined;

  // socialType을 socialProvider 형식으로 변환
  const socialProvider = loggedInUser?.socialType?.toLowerCase() as
    | "google"
    | "kakao"
    | "naver"
    | "apple"
    | undefined;

  return (
    <>
      <main className="h-[calc(100dvh-env(safe-area-inset-top,0px)-var(--footer-height))] w-full max-w-[480px] mx-auto bg-default flex flex-col overflow-y-auto">
        {/* Header */}
        <SimpleHeader
          title="마이페이지"
          rightElement={
            <button
              onClick={handleSupport}
              className="w-6 h-6 flex items-center justify-center"
              aria-label="문의하기"
            >
              <Headset size={24} className="stroke-icon" strokeWidth={2} />
            </button>
          }
        />

        {/* Main Content */}
        <div className="flex flex-col gap-8 px-5 pb-5">
          {/* Profile Section + Stats */}
          <div className="flex flex-col gap-6">
            <ProfileSection
              isLoggedIn={isLoggedIn}
              nickname={loggedInUser?.nickname}
              email={loggedInUser?.email}
              profileImage={loggedInUser?.profileImageUrl ?? undefined}
              socialProvider={socialProvider}
              isAdmin={isAdmin}
              onEditProfile={handleEditProfile}
              onEditNickname={handleEditNickname}
              onLogin={handleLogin}
            />

            {/* Stats Card */}
            <div className="flex items-center border rounded-[8px] py-3 px-4">
              <button
                onClick={handleFavorites}
                className="flex flex-col items-center flex-1 gap-1 px-3"
                aria-label="관심있는 매장으로 이동"
              >
                <span className="text-[18px] font-semibold leading-[1.4] tracking-[-0.18px] text-grey-900">
                  {loggedInUser?.favoriteCount ?? 0}
                </span>
                <span className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-600">
                  관심있는 매장
                </span>
              </button>
              <div className="w-px h-8 bg-grey-200" />
              <div className="flex flex-col items-center flex-1 gap-1 px-3">
                <span className="text-[18px] font-semibold leading-[1.4] tracking-[-0.18px] text-grey-900">
                  {loggedInUser?.reportCount ?? 0}
                </span>
                <span className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-600">
                  제보한 매장
                </span>
              </div>
              <div className="w-px h-8 bg-grey-200" />
              <div className="flex flex-col items-center flex-1 gap-1 px-3">
                <span className="text-[18px] font-semibold leading-[1.4] tracking-[-0.18px] text-grey-900">
                  {loggedInUser?.reviewCount ?? 0}
                </span>
                <span className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-600">
                  작성한 리뷰
                </span>
              </div>
            </div>
          </div>

          {/* Menu List */}
          <div className="w-full">
            <MenuList
              onMyReports={handleMyReports}
              onBlockedUsers={handleBlockedUsers}
              onTerms={handleTerms}
              onAbout={handleAbout}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Logout / Withdraw - 로그인 상태일 때만 표시 */}
          {isLoggedIn && (
            <div className="flex items-center justify-center gap-9 py-4">
              <button onClick={handleLogout} className="border-b-[0.75px] border-grey-400">
                <span className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-400">
                  로그아웃
                </span>
              </button>
              <div className="w-0 h-3.5 border-l border-grey-200" />
              <button onClick={handleWithdraw} className="border-b-[0.75px] border-grey-400">
                <span className="text-[13px] font-medium leading-[1.5] tracking-[-0.13px] text-grey-400">
                  회원탈퇴
                </span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        currentNickname={user?.nickname ?? ""}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={handleSaveNickname}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawSubmit}
      />
      <WithdrawConfirmModal
        isOpen={isWithdrawConfirmModalOpen}
        onClose={() => setIsWithdrawConfirmModalOpen(false)}
        onConfirm={handleWithdrawConfirm}
      />

      {/* Footer Navigation */}
      <Footer />
    </>
  );
}
