"use client";

import Image from "next/image";
import { ChevronLeft, Plus, SquarePen } from "lucide-react";
import { DEFAULT_IMAGES, getSocialProviderIcon } from "@/constants";

const SOCIAL_PROVIDER_LABELS = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
} as const;

interface ProfileSectionProps {
  isLoggedIn?: boolean;
  nickname?: string;
  email?: string;
  profileImage?: string;
  socialProvider?: "google" | "kakao" | "naver";
  isAdmin?: boolean;
  onEditProfile?: (file: File) => void;
  onEditNickname?: () => void;
  onLogin?: () => void;
}

export function ProfileSection({
  isLoggedIn = true,
  nickname = "빨간캡슐#21",
  email = "abcd123@gmail.com",
  profileImage = DEFAULT_IMAGES.PROFILE,
  socialProvider = "google",
  isAdmin = false,
  onEditProfile,
  onEditNickname,
  onLogin,
}: ProfileSectionProps) {
  const handleProfileImageChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png,image/webp";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onEditProfile?.(file);
      }
    };
    input.click();
  };

  // 게스트 상태 (로그인하지 않은 경우)
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 w-full px-5">
        {/* 기본 프로필 이미지 */}
        <div className="w-[100px] h-[100px] rounded-full bg-main-50 overflow-hidden flex items-center justify-center">
          <Image
            src={DEFAULT_IMAGES.PROFILE}
            alt="프로필 이미지"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        {/* 로그인 유도 버튼 */}
        <button
          onClick={onLogin}
          className="flex items-center justify-center gap-0"
          aria-label="로그인하러 가기"
        >
          <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
            로그인을 해주세요
          </h2>
          <div className="w-6 h-6 flex items-center justify-center">
            <ChevronLeft
              size={12}
              className="stroke-grey-900 rotate-180 scale-y-[-1]"
              strokeWidth={2}
            />
          </div>
        </button>
      </div>
    );
  }

  // 로그인 상태
  return (
    <div className="flex flex-col items-center gap-7 w-full px-5">
      {/* Profile Image */}
      <div className="flex flex-col items-center gap-3 w-[168px]">
        <div className="relative w-[100px] h-[100px]">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={profileImage}
              alt="프로필 이미지"
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>
          {/* Edit Button */}
          <button
            onClick={handleProfileImageChange}
            className="absolute bottom-0 right-0 w-6 h-6 bg-grey-900 rounded-full flex items-center justify-center"
            aria-label="프로필 수정"
          >
            <Plus size={16} className="stroke-white" strokeWidth={2} />
          </button>
        </div>

        {/* Nickname & Email */}
        <div className="flex flex-col items-center gap-1 w-full">
          {/* Nickname with edit icon */}
          <div className="flex items-center gap-[3px]">
            <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900 whitespace-nowrap">
              {nickname}
            </h2>
            <button
              onClick={onEditNickname}
              className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
              aria-label="닉네임 수정"
            >
              <SquarePen size={16} className="stroke-grey-700" strokeWidth={2} />
            </button>
          </div>

          {/* Social Login Info */}
          <div className="bg-grey-50 rounded-md px-2 py-0.5 flex items-center gap-2 w-full justify-center">
            <Image
              src={getSocialProviderIcon(socialProvider)}
              alt={socialProvider ? SOCIAL_PROVIDER_LABELS[socialProvider] : ""}
              width={14}
              height={14}
              style={{ width: "auto", height: "auto" }}
            />
            <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-800 text-center">
              {email}
            </p>
            {isAdmin && (
              <span className="bg-main text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
