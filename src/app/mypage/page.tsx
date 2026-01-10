"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Headset } from "lucide-react";
import { Toast } from "@/components/common";
import Footer from "@/components/common/Footer";
import { LogoutModal } from "@/components/mypage/LogoutModal";
import { MenuList } from "@/components/mypage/MenuList";
import { NicknameModal } from "@/components/mypage/NicknameModal";
import { ProfileSection } from "@/components/mypage/ProfileSection";
import { WithdrawConfirmModal } from "@/components/mypage/WithdrawConfirmModal";
import { WithdrawModal } from "@/components/mypage/WithdrawModal";
import { openInstagramSupport } from "@/utils";

export default function MyPage() {
  const router = useRouter();

  // TODO: 백엔드 API 연동 후 실제 로그인 상태 확인 로직으로 교체
  // 현재는 임시로 로컬 상태로 관리 (true: 로그인, false: 게스트)
  const [isLoggedIn, _setIsLoggedIn] = useState(true);
  const [nickname, setNickname] = useState("빨간캡슐#21");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawConfirmModalOpen, setIsWithdrawConfirmModalOpen] = useState(false);
  const [withdrawReasons, setWithdrawReasons] = useState<string[]>([]);
  const [withdrawOtherReason, setWithdrawOtherReason] = useState<string>();
  const [showToast, setShowToast] = useState(false);

  const handleEditProfile = () => {
    // TODO: 프로필 사진 변경 API 연동
  };

  const handleEditNickname = () => {
    setIsNicknameModalOpen(true);
  };

  const handleSaveNickname = (newNickname: string) => {
    // TODO: 백엔드 API 연동 - 닉네임 변경
    setNickname(newNickname);
    setShowToast(true);
  };

  const handleMyReports = () => {
    router.push("/mypage/my-reports");
  };

  const handleTerms = () => {
    router.push("/mypage/terms");
  };

  const handleAbout = () => {
    router.push("/mypage/about");
  };

  const handleSupport = () => {
    openInstagramSupport();
  };

  const handleLogin = () => {
    // TODO: 로그인 페이지로 이동
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // TODO: 로그아웃 API 연동
      // await apiClient.post('/auth/logout');
    } catch (error) {
      // API 실패 시에도 로컬 데이터는 정리
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // 세션 스토리지 정리
      sessionStorage.clear();

      // 쿠키 정리 (HttpOnly 쿠키는 서버에서 처리, 클라이언트 쿠키는 여기서 제거)
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // TODO: SWR/React Query 캐시 정리
      // mutate(() => true, undefined, { revalidate: false });

      setIsLogoutModalOpen(false);
      router.push("/");
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = (reasons: string[], otherReason?: string) => {
    setWithdrawReasons(reasons);
    setWithdrawOtherReason(otherReason);
    setIsWithdrawModalOpen(false);
    setIsWithdrawConfirmModalOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    try {
      // TODO: 회원탈퇴 API 연동
      // await apiClient.delete('/user', { data: { reasons: withdrawReasons, otherReason: withdrawOtherReason } });

      // API 성공 시에만 상태 정리
      // 로컬 스토리지 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // 세션 스토리지 정리
      sessionStorage.clear();

      // 쿠키 정리 (HttpOnly 쿠키는 서버에서 처리, 클라이언트 쿠키는 여기서 제거)
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // TODO: SWR/React Query 캐시 정리
      // mutate(() => true, undefined, { revalidate: false });

      // 회원탈퇴 관련 상태 초기화
      setWithdrawReasons([]);
      setWithdrawOtherReason(undefined);

      // 모달 닫기 및 홈으로 이동
      setIsWithdrawConfirmModalOpen(false);
      router.push("/");
    } catch (error) {
      // API 실패 시 에러 로그 및 모달 유지
      console.error("회원탈퇴 API 호출 실패:", error);
      // TODO: 에러 토스트 메시지 표시
      // setShowToast(true);
      // setToastMessage("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative pb-[70px]">
      {/* Header */}
      <header className="bg-white h-12 flex items-center px-5 py-2">
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-6 flex items-center">
          마이
        </h1>
        <button
          onClick={handleSupport}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="문의하기"
        >
          <Headset size={24} className="stroke-icon" strokeWidth={2} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-7 pt-[60px] px-5">
        {/* Profile Section */}
        <ProfileSection
          isLoggedIn={isLoggedIn}
          nickname={nickname}
          onEditProfile={handleEditProfile}
          onEditNickname={handleEditNickname}
          onLogin={handleLogin}
        />

        {/* Menu List */}
        <div className="w-full max-w-[335px] mx-auto">
          <MenuList onMyReports={handleMyReports} onTerms={handleTerms} onAbout={handleAbout} />
        </div>
      </main>

      {/* Modals */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        currentNickname={nickname}
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

      {/* Logout / Withdraw - 로그인 상태일 때만 표시 */}
      {isLoggedIn && (
        <div className="absolute bottom-[70px] pb-8 left-0 w-full flex items-center justify-center gap-9 px-5">
          <button onClick={handleLogout} className="border-b-[0.75px] border-grey-400">
            <span className="text-[12px] font-medium leading-[1.5] tracking-[-0.12px] text-grey-400">
              로그아웃
            </span>
          </button>
          <div className="w-0 h-3.5 border-l border-grey-200" />
          <button onClick={handleWithdraw} className="border-b-[0.75px] border-grey-400">
            <span className="text-[12px] font-medium leading-[1.5] tracking-[-0.12px] text-grey-400">
              회원탈퇴
            </span>
          </button>
        </div>
      )}

      {/* Footer Navigation */}
      <Footer />

      {/* Toast */}
      <Toast
        message="닉네임이 변경되었습니다"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
