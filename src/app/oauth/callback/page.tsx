"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useDelayedRedirectWithToast, useAuth } from "@/hooks";
import type { TokenExchangeApiResponse } from "@/types/api";

/**
 * OAuth 콜백 페이지
 * 백엔드에서 소셜 로그인 성공 후 임시 코드와 함께 리다이렉트되는 페이지
 * URL 파라미터: code (임시 코드, 30초 TTL, 1회용)
 *
 * 플로우:
 * 1. URL에서 code 추출
 * 2. POST /api/auth/token 호출하여 토큰 교환
 * 3. 응답의 accessToken, refreshToken 저장
 * 4. isNewUser에 따라 닉네임 설정 또는 홈으로 이동
 */
function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirectWithToast } = useDelayedRedirectWithToast();
  const { login, isLoggedIn } = useAuth();

  // 중복 실행 방지 플래그
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // 이미 처리 중이면 무시 (새로고침/탭 복제 방지)
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    const code = searchParams.get("code")?.trim();

    // URL에서 파라미터 제거 (새로고침 시 재처리 방지)
    if (code) {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }

    // 백엔드 에러 코드 패턴 (A001, A005 등)
    const isErrorCode = code && /^A\d{3}$/.test(code);

    // 에러 코드가 있는 경우 (로그인 실패)
    if (isErrorCode) {
      console.error("소셜 로그인 실패:", code);
      const errorMessage = searchParams.get("message") || "로그인에 실패했어요. 다시 시도해주세요.";
      redirectWithToast(errorMessage, "/login");
      return;
    }

    // 코드가 없는 경우
    if (!code) {
      // 이미 로그인된 상태인지 확인
      if (isLoggedIn) {
        router.replace("/home");
        return;
      }
      console.error("인증 코드가 없어요");
      redirectWithToast("로그인에 실패했어요. 다시 시도해주세요.", "/login");
      return;
    }

    // 토큰 교환 API 호출
    const exchangeToken = async () => {
      try {
        const { data } = await apiClient.post<TokenExchangeApiResponse>(ENDPOINTS.AUTH.TOKEN, {
          code,
        });

        if (!data.success || !data.data) {
          throw new Error("토큰 교환에 실패했어요.");
        }

        const { accessToken, refreshToken, isNewUser } = data.data;

        // 전역 인증 상태 업데이트 (토큰 저장 포함)
        login(accessToken, refreshToken);

        // 신규 사용자면 닉네임 설정 페이지로, 기존 사용자면 스플래시 후 홈으로 이동
        if (isNewUser) {
          router.replace("/login/nickname");
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("토큰 교환 실패:", error);
        redirectWithToast("로그인에 실패했어요. 다시 시도해주세요.", "/login");
      }
    };

    exchangeToken();
  }, [searchParams, router, redirectWithToast, login, isLoggedIn]);

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-default">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
        <p className="text-[16px] font-medium text-grey-700">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-default">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-grey-200 border-t-main" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
