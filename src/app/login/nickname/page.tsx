"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import apiClient from "@/api/client";

interface NicknameResponse {
  success: boolean;
  data: {
    nickname: string;
  };
}

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드에서 닉네임 조회
  const fetchNickname = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<NicknameResponse>("/api/users/me/nickname");
      if (response.data.success && response.data.data.nickname) {
        setNickname(response.data.data.nickname);
      } else {
        setError("닉네임을 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("닉네임 조회 실패:", err);
      setError("닉네임을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 토큰 확인
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    fetchNickname();
  }, [router, fetchNickname]);

  const handleBack = () => {
    // 뒤로가기 시 로그인 취소 처리
    // 토큰 삭제 후 로그인 페이지로 이동
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_type");
    router.replace("/login");
  };

  const handleStart = () => {
    // 닉네임은 백엔드에서 이미 저장되어 있음
    // user_type만 설정하고 홈으로 이동
    localStorage.setItem("user_type", "member");
    router.replace("/home");
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-default">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
          <p className="text-[16px] font-medium text-grey-700">닉네임을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-default">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[16px] font-medium text-grey-700">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchNickname}
              className="rounded-lg bg-main px-6 py-2 text-white hover:bg-main-700"
            >
              다시 시도
            </button>
            <button
              onClick={handleBack}
              className="rounded-lg border border-grey-300 bg-white px-6 py-2 text-grey-700 hover:bg-grey-50"
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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
