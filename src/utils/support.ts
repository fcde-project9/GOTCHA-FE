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
 * API Base URL 가져오기
 * window.location.origin을 사용하여 현재 도메인을 API 베이스로 사용
 * SSR 환경에서는 undefined 반환
 */
function getApiBaseUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.location.origin;
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
 * 카카오 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} window 객체를 사용할 수 없거나 로그인 처리 중 오류 발생 시
 */
export function loginWithKakao(): void {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    const errorMessage = "로그인을 처리할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error("API Base URL을 가져올 수 없습니다. (SSR 환경이거나 window 객체 없음)");
  }

  try {
    // CSRF 방지를 위한 state 생성 및 저장
    const state = generateSecureState();
    sessionStorage.setItem("kakao_oauth_state", state);

    // state 파라미터를 포함한 OAuth URL 생성
    const kakaoAuthUrl = `${apiBaseUrl}/oauth2/authorize/kakao?state=${encodeURIComponent(state)}`;
    window.location.href = kakaoAuthUrl;
  } catch (error) {
    const errorMessage = "카카오 로그인을 시작할 수 없습니다. 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error(`카카오 로그인 실패: ${error}`);
  }
}

/**
 * 네이버 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} window 객체를 사용할 수 없거나 로그인 처리 중 오류 발생 시
 */
export function loginWithNaver(): void {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    const errorMessage = "로그인을 처리할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error("API Base URL을 가져올 수 없습니다. (SSR 환경이거나 window 객체 없음)");
  }

  try {
    // CSRF 방지를 위한 state 생성 및 저장
    const state = generateSecureState();
    sessionStorage.setItem("naver_oauth_state", state);

    // state 파라미터를 포함한 OAuth URL 생성
    const naverAuthUrl = `${apiBaseUrl}/oauth2/authorize/naver?state=${encodeURIComponent(state)}`;
    window.location.href = naverAuthUrl;
  } catch (error) {
    const errorMessage = "네이버 로그인을 시작할 수 없습니다. 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error(`네이버 로그인 실패: ${error}`);
  }
}

/**
 * 구글 OAuth 로그인
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * CSRF 공격 방지를 위해 state 파라미터 생성 및 검증
 * @throws {Error} window 객체를 사용할 수 없거나 로그인 처리 중 오류 발생 시
 */
export function loginWithGoogle(): void {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    const errorMessage = "로그인을 처리할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error("API Base URL을 가져올 수 없습니다. (SSR 환경이거나 window 객체 없음)");
  }

  try {
    // CSRF 방지를 위한 state 생성 및 저장
    const state = generateSecureState();
    sessionStorage.setItem("google_oauth_state", state);

    // state 파라미터를 포함한 OAuth URL 생성
    const googleAuthUrl = `${apiBaseUrl}/oauth2/authorize/google?state=${encodeURIComponent(state)}`;
    window.location.href = googleAuthUrl;
  } catch (error) {
    const errorMessage = "구글 로그인을 시작할 수 없습니다. 다시 시도해주세요.";
    alert(errorMessage);
    throw new Error(`구글 로그인 실패: ${error}`);
  }
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
      const errorMessage = "지원하지 않는 로그인 방식입니다.";
      alert(errorMessage);
      throw new Error(`알 수 없는 로그인 제공자: ${provider}`);
    }
  }
}
