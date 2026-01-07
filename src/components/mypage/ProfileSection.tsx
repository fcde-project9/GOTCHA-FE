"use client";

import Image from "next/image";
import { Plus, SquarePen } from "lucide-react";

interface ProfileSectionProps {
  nickname?: string;
  email?: string;
  profileImage?: string;
  onEditProfile?: () => void;
  onEditNickname?: () => void;
}

export function ProfileSection({
  nickname = "빨간캡슐#21",
  email = "abcd123@gmail.com",
  profileImage = "/images/default-profile.png",
  onEditProfile,
  onEditNickname,
}: ProfileSectionProps) {
  return (
    <div className="flex flex-col items-center gap-7 w-full px-5">
      {/* Profile Image */}
      <div className="flex flex-col items-center gap-3 w-[168px]">
        <div className="relative w-[88px] h-[88px]">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image src={profileImage} alt="프로필 이미지" fill className="object-cover" />
          </div>
          {/* Edit Button */}
          <button
            onClick={onEditProfile}
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
            <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.2px] text-grey-900">
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

          {/* Email */}
          <div className="bg-grey-50 rounded-md px-2 py-0.5 flex items-center gap-2 w-full justify-center">
            <Image src="/images/icons/google.png" alt="Google" width={14} height={14} />
            <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-800 text-center">
              {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
