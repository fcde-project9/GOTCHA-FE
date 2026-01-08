/**
 * 고객 지원 및 인증 관련 유틸리티 함수
 */

/**
 * Instagram DM으로 문의하기
 * - 새 창에서 Instagram Direct Message를 엽니다
 * - Tabnabbing 방지를 위해 opener를 null로 설정합니다
 * - 환경변수 NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL이 없으면 기본값(gotcha_map) 사용
 */
export function openInstagramSupport(): void {
  const instagramDmUrl =
    process.env.NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL || "https://ig.me/m/gotcha_map";

  const newWindow = window.open(instagramDmUrl, "_blank", "noopener,noreferrer");

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
 * 카카오 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 */
export function loginWithKakao(): void {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
    return;
  }

  const kakaoAuthUrl = `${apiBaseUrl}/oauth2/authorize/kakao`;
  window.location.href = kakaoAuthUrl;
}

/**
 * 네이버 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 */
export function loginWithNaver(): void {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
    return;
  }

  const naverAuthUrl = `${apiBaseUrl}/oauth2/authorize/naver`;
  window.location.href = naverAuthUrl;
}

/**
 * 구글 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 */
export function loginWithGoogle(): void {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
    return;
  }

  const googleAuthUrl = `${apiBaseUrl}/oauth2/authorize/google`;
  window.location.href = googleAuthUrl;
}

/**
 * 소셜 로그인 실행
 * @param provider - 로그인 제공자 (kakao, naver, google)
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
    default:
      console.error(`Unknown provider: ${provider}`);
  }
}
