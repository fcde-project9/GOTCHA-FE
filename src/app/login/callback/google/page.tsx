"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast } from "@/components/common";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const receivedState = searchParams.get("state");

    // 에러 체크
    if (error) {
      console.error("구글 로그인 실패:", error);
      setToastMessage("구글 로그인에 실패했습니다. 다시 시도해주세요.");
      setShowToast(true);

      // 토스트를 보여준 후 리다이렉트
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      return;
    }

    // CSRF 방지: state 파라미터 검증
    const storedState = sessionStorage.getItem("google_oauth_state");

    if (!receivedState || !storedState || receivedState !== storedState) {
      console.error("CSRF 검증 실패: state 파라미터 불일치", {
        received: receivedState,
        stored: storedState,
      });
      // state 검증 실패 시 저장된 state 제거 및 로그인 페이지로 리다이렉트
      sessionStorage.removeItem("google_oauth_state");
      setToastMessage("보안 검증에 실패했습니다. 다시 로그인해주세요.");
      setShowToast(true);

      // 토스트를 보여준 후 리다이렉트
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      return;
    }

    // state 검증 성공 - 재사용 방지를 위해 즉시 제거
    sessionStorage.removeItem("google_oauth_state");

    if (code) {
      // TODO: 백엔드 API 연동 - 구글 인증 코드로 토큰 교환 및 사용자 정보 가져오기
      // const response = await apiClient.post('/auth/google/callback', { code });
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
    <>
      <div className="flex min-h-screen w-full items-center justify-center bg-default">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
          <p className="text-[16px] font-medium text-grey-700">구글 로그인 중...</p>
        </div>
      </div>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-default">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main"></div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
