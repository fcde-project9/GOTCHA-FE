/**
 * 고객 지원 및 인증 관련 유틸리티 함수
 */

import { SUPPORT_URLS } from "@/constants";
import { isNativeApp } from "./platform";

/**
 * 문의하기 폼 열기
 * - 웹: 새 창에서 문의 폼을 엽니다
 * - 네이티브: 인앱 브라우저로 엽니다
 */
export async function openContactSupport(): Promise<void> {
  if (isNativeApp()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: SUPPORT_URLS.CONTACT_FORM });
    return;
  }

  const newWindow = window.open(SUPPORT_URLS.CONTACT_FORM, "_blank", "noopener,noreferrer");

  // Tabnabbing 방지: opener를 null로 설정
  if (newWindow) {
    newWindow.opener = null;
  }
}

/**
 * 소셜 로그인 타입
 */
export type SocialLoginProvider = "kakao" | "naver" | "google" | "apple";

/**
 * API Base URL 가져오기
 * 환경변수 NEXT_PUBLIC_API_BASE_URL을 사용
 * 환경변수가 설정되지 않은 경우 undefined 반환
 */
function getApiBaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_API_BASE_URL;
}

/**
 * CSRF 방지를 위한 랜덤 state 생성
 * 암호학적으로 안전한 난수를 사용하여 예측 불가능한 state 문자열 생성
 * @returns 32자리 16진수 문자열
 */
function generateSecureState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * OAuth 리디렉트 URI 생성
 * - 웹: 현재 도메인 기반 콜백 URL
 * - 네이티브: 커스텀 URL 스킴 기반 콜백
 */
function getOAuthRedirectUri(): string {
  if (isNativeApp()) {
    return "gotchaapp://oauth/callback";
  }
  return `${window.location.origin}/oauth/callback`;
}

/**
 * OAuth 로그인 공통 헬퍼 함수
 * - 웹: 백엔드 OAuth 엔드포인트로 리다이렉트
 * - 네이티브: 인앱 브라우저로 OAuth 플로우 진행
 */
async function redirectToOAuth(
  provider: SocialLoginProvider,
  providerDisplayName: string
): Promise<void> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    const errorMessage = "로그인을 처리할 수 없어요. 페이지를 새로고침 후 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error(
      "API Base URL이 설정되지 않았어요. (NEXT_PUBLIC_API_BASE_URL 환경변수 확인 필요)"
    );
  }

  try {
    // CSRF 방지를 위한 state 생성 및 저장
    const state = generateSecureState();
    sessionStorage.setItem(`${provider}_oauth_state`, state);

    // GA 이벤트 추적을 위해 provider 저장
    sessionStorage.setItem("oauth_provider", provider);

    const callbackUrl = getOAuthRedirectUri();
    const oauthUrl = `${apiBaseUrl}/oauth2/authorize/${provider}?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

    if (isNativeApp()) {
      // 네이티브: 인앱 브라우저로 OAuth 진행, 딥링크로 복귀
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: oauthUrl });
    } else {
      // 웹: 페이지 리디렉트
      window.location.replace(oauthUrl);
    }
  } catch (error) {
    const errorMessage = `${providerDisplayName} 로그인을 시작할 수 없어요. 다시 시도해주세요.`;
    alert(errorMessage);
    throw new Error(`${providerDisplayName} 로그인 실패: ${error}`);
  }
}

/**
 * 카카오 OAuth 로그인
 */
export function loginWithKakao(): void {
  redirectToOAuth("kakao", "카카오");
}

/**
 * 네이버 OAuth 로그인
 */
export function loginWithNaver(): void {
  redirectToOAuth("naver", "네이버");
}

/**
 * 구글 OAuth 로그인
 */
export function loginWithGoogle(): void {
  redirectToOAuth("google", "구글");
}

/**
 * 애플 OAuth 로그인
 */
export function loginWithApple(): void {
  redirectToOAuth("apple", "Apple");
}

/**
 * 소셜 로그인 실행
 */
export function loginWithSocial(provider: SocialLoginProvider): void {
  switch (provider) {
    case "kakao":
      loginWithKakao();
      break;
    case "naver":
      loginWithNaver();
      break;
    case "google":
      loginWithGoogle();
      break;
    case "apple":
      loginWithApple();
      break;
    default: {
      const errorMessage = "지원하지 않는 로그인 방식이에요.";
      alert(errorMessage);
      throw new Error(`알 수 없는 로그인 제공자: ${provider}`);
    }
  }
}
