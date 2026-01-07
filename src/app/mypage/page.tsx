"use client";

import { Headset } from "lucide-react";
import Footer from "@/components/common/Footer";
import { MenuList } from "@/components/mypage/MenuList";
import { ProfileSection } from "@/components/mypage/ProfileSection";

export default function MyPage() {
  const handleEditProfile = () => {};

  const handleEditNickname = () => {};

  const handleMyReports = () => {};

  const handleTerms = () => {};

  const handleAbout = () => {};

  const handleLogout = () => {};

  const handleWithdraw = () => {};

  return (
    <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto relative pb-[70px]">
      {/* Header */}
      <header className="bg-white h-12 flex items-center px-5 py-2">
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 h-6 flex items-center">
          마이
        </h1>
        <button className="w-6 h-6 flex items-center justify-center" aria-label="고객센터">
          <Headset size={24} className="stroke-icon" strokeWidth={2} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-7 pt-[60px] px-5">
        {/* Profile Section */}
        <ProfileSection onEditProfile={handleEditProfile} onEditNickname={handleEditNickname} />

        {/* Menu List */}
        <div className="w-full max-w-[335px] mx-auto">
          <MenuList onMyReports={handleMyReports} onTerms={handleTerms} onAbout={handleAbout} />
        </div>
      </main>

      {/* Logout / Withdraw */}
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

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
