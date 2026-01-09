"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast } from "@/components/common";
import { useDelayedRedirectWithToast } from "@/hooks";

/**
 * OAuth 콜백 페이지
 * 백엔드에서 소셜 로그인 성공 후 토큰과 함께 리다이렉트되는 페이지
 * URL 파라미터: accessToken, refreshToken, isNewUser
 */
function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toastMessage, showToast, setShowToast, redirectWithToast } =
    useDelayedRedirectWithToast();

  // 중복 실행 방지 플래그
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // 이미 처리 중이면 무시 (새로고침/탭 복제 방지)
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    const accessToken = searchParams.get("accessToken")?.trim();
    const refreshToken = searchParams.get("refreshToken")?.trim();
    const isNewUser = searchParams.get("isNewUser") === "true";
    const errorCode = searchParams.get("code");

    // URL에서 파라미터 제거 (새로고침 시 재처리 방지)
    if (accessToken || refreshToken || errorCode) {
      window.history.replaceState({}, "", "/oauth/callback");
    }

    // 에러 코드가 있는 경우 (로그인 실패)
    if (errorCode) {
      console.error("소셜 로그인 실패:", errorCode);
      const errorMessage =
        searchParams.get("message") || "로그인에 실패했습니다. 다시 시도해주세요.";
      redirectWithToast(errorMessage, "/login");
      return;
    }

    // 토큰이 없거나 빈 문자열인 경우
    if (!accessToken || !refreshToken) {
      // 이미 로그인된 상태인지 확인
      const existingToken = localStorage.getItem("accessToken");
      if (existingToken) {
        router.replace("/home");
        return;
      }
      console.error("토큰이 없습니다");
      redirectWithToast("로그인에 실패했습니다. 다시 시도해주세요.", "/login");
      return;
    }

    // 토큰 저장 (localStorage 에러 핸들링)
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user_type", "member");
    } catch (error) {
      console.error("토큰 저장 실패:", error);
      redirectWithToast(
        "로그인 정보를 저장할 수 없습니다. 브라우저 설정을 확인해주세요.",
        "/login"
      );
      return;
    }

    // 신규 사용자면 닉네임 설정 페이지로, 기존 사용자면 홈으로 이동
    // replace 사용: 뒤로가기 시 콜백 페이지로 돌아오지 않도록 함
    if (isNewUser) {
      router.replace("/login/nickname");
    } else {
      router.replace("/home");
    }
  }, [searchParams, router, redirectWithToast]);

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center bg-default">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
          <p className="text-[16px] font-medium text-grey-700">로그인 처리 중...</p>
        </div>
      </div>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-default">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
