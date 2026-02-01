/**
 * 고객 지원 및 인증 관련 유틸리티 함수
 */

import { SOCIAL_URLS } from "@/constants";

/**
 * Instagram DM으로 문의하기
 * - 새 창에서 Instagram Direct Message를 엽니다
 * - Tabnabbing 방지를 위해 opener를 null로 설정합니다
 */
export function openInstagramSupport(): void {
  const newWindow = window.open(SOCIAL_URLS.INSTAGRAM_DM, "_blank", "noopener,noreferrer");

  // Tabnabbing 방지: opener를 null로 설정
  if (newWindow) {
    newWindow.opener = null;
  }
}

/**
 * 소셜 로그인 타입
 */
export type SocialLoginProvider = "kakao" | "naver" | "google";

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
 * OAuth 로그인 공통 헬퍼 함수
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * @param provider - OAuth 제공자 이름 (kakao, naver, google)
 * @param providerDisplayName - 에러 메시지에 표시할 제공자 이름
 * @throws {Error} 환경변수가 설정되지 않았거나 로그인 처리 중 오류 발생 시
 */
function redirectToOAuth(provider: SocialLoginProvider, providerDisplayName: string): void {
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

    // 현재 도메인의 콜백 URL 생성 (로컬/배포 환경 자동 대응)
    const callbackUrl = `${window.location.origin}/oauth/callback`;

    // state와 redirect_uri 파라미터를 포함한 OAuth URL 생성
    // replace 사용: /login 페이지를 히스토리에서 제거 (뒤로가기 시 /login으로 안 돌아감)
    const oauthUrl = `${apiBaseUrl}/oauth2/authorize/${provider}?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
    window.location.replace(oauthUrl);
  } catch (error) {
    const errorMessage = `${providerDisplayName} 로그인을 시작할 수 없어요. 다시 시도해주세요.`;
    alert(errorMessage);
    throw new Error(`${providerDisplayName} 로그인 실패: ${error}`);
  }
}

/**
 * 카카오 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} 환경변수가 설정되지 않았거나 로그인 처리 중 오류 발생 시
 */
export function loginWithKakao(): void {
  redirectToOAuth("kakao", "카카오");
}

/**
 * 네이버 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} 환경변수가 설정되지 않았거나 로그인 처리 중 오류 발생 시
 */
export function loginWithNaver(): void {
  redirectToOAuth("naver", "네이버");
}

/**
 * 구글 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} 환경변수가 설정되지 않았거나 로그인 처리 중 오류 발생 시
 */
export function loginWithGoogle(): void {
  redirectToOAuth("google", "구글");
}

/**
 * 소셜 로그인 실행
 * @param provider - 로그인 제공자 (kakao, naver, google)
 * @throws {Error} 알 수 없는 제공자이거나 로그인 처리 중 오류 발생 시
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
    default: {
      const errorMessage = "지원하지 않는 로그인 방식이에요.";
      alert(errorMessage);
      throw new Error(`알 수 없는 로그인 제공자: ${provider}`);
    }
  }
}
