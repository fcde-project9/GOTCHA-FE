"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    // TODO: 백엔드 API 연동 - 서버에서 닉네임 자동 생성
    // 임시로 랜덤 닉네임 생성 (예시)
    const colors = ["빨강", "파랑", "노랑", "초록", "보라"];
    const items = ["캡슐", "구슬", "별", "하트", "다이아"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const randomNumber = Math.floor(Math.random() * 100);

    setNickname(`${randomColor}${randomItem}#${randomNumber}`);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleStart = () => {
    // TODO: 백엔드 API 연동 - 닉네임 확정 및 회원가입 완료
    // 임시로 로컬스토리지에 저장 (클라이언트에서만)
    if (typeof window !== "undefined") {
      localStorage.setItem("user_type", "social");
      localStorage.setItem("nickname", nickname);
    }

    router.push("/home");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-default">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        {/* 헤더 */}
        <header className="flex h-12 items-center px-5 py-2">
          <button onClick={handleBack} className="flex items-center justify-center">
            <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
          </button>
        </header>

        {/* 컨텐츠 */}
        <main className="flex flex-1 flex-col items-center justify-center px-5">
          {/* 닉네임 영역 */}
          <div className="flex flex-col items-center gap-7">
            {/* 기본 프로필 이미지 */}
            <div className="w-[108px] h-[108px] rounded-full bg-main-50 overflow-hidden flex items-center justify-center">
              <Image
                src="/images/default-profile.png"
                alt="프로필 이미지"
                width={108}
                height={108}
                className="object-cover"
              />
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-[18px] font-medium leading-[1.3] tracking-[-0.18px] text-grey-900">
                닉네임
              </p>
              <p className="text-center text-[28px] font-bold leading-[1.3] tracking-[-0.28px] text-main">
                {nickname}
              </p>
              <p className="text-center text-[18px] font-medium leading-[1.3] tracking-[-0.18px] text-grey-900">
                (으)로 시작할게요
              </p>
            </div>

            {/* 안내 문구 */}
            <p className="text-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600">
              닉네임은 마이페이지에서 수정할 수 있어요
            </p>
          </div>
        </main>

        {/* 시작하기 버튼 - 바닥에서 52px 위 */}
        <div className="mb-12 left-0 right-0 px-5">
          <button
            onClick={handleStart}
            className="h-14 w-full rounded-lg bg-main font-semibold text-[16px] leading-[1.5] tracking-[-0.352px] text-white transition-colors hover:bg-main-700 active:bg-main-900"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
