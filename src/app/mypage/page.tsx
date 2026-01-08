"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Headset } from "lucide-react";
import { Toast } from "@/components/common";
import Footer from "@/components/common/Footer";
import { MenuList } from "@/components/mypage/MenuList";
import { NicknameModal } from "@/components/mypage/NicknameModal";
import { ProfileSection } from "@/components/mypage/ProfileSection";

export default function MyPage() {
  const router = useRouter();

  // TODO: 백엔드 API 연동 후 실제 로그인 상태 확인 로직으로 교체
  // 현재는 임시로 로컬 상태로 관리 (true: 로그인, false: 게스트)
  const [isLoggedIn, _setIsLoggedIn] = useState(true);
  const [nickname, setNickname] = useState("빨간캡슐#21");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
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
    // TODO: 인스타그램 디엠으로 이동
    window.open("https://instagram.com/direct/inbox/", "_blank");
  };

  const handleLogin = () => {
    // TODO: 로그인 페이지로 이동
  };

  const handleLogout = () => {
    // TODO: 로그아웃 API 연동
  };

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 확인 모달 열기
  };

  return (
    <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto relative pb-[70px]">
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

      {/* Nickname Modal */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        currentNickname={nickname}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={handleSaveNickname}
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
