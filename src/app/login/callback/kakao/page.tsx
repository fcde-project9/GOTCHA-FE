"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("카카오 로그인 실패:", error);
      router.push("/login");
      return;
    }

    if (code) {
      // TODO: 백엔드 API 연동 - 카카오 인증 코드로 토큰 교환 및 사용자 정보 가져오기
      // const response = await apiClient.post('/auth/kakao/callback', { code });
      // if (response.data.isNewUser) {
      //   router.push('/login/nickname');
      // } else {
      //   router.push('/home');
      // }

      // 임시: 닉네임 설정 페이지로 이동 (신규 사용자 가정)
      router.push("/login/nickname");
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-default">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
        <p className="text-[16px] font-medium text-grey-700">카카오 로그인 중...</p>
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-default">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
