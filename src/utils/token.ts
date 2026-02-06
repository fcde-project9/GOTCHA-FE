/**
 * JWT 토큰 만료 여부 확인
 * @param token JWT 토큰
 * @returns 만료되었으면 true, 유효하면 false
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp는 초 단위, Date.now()는 밀리초 단위
    return payload.exp * 1000 < Date.now();
  } catch {
    // 파싱 실패 시 만료된 것으로 처리
    return true;
  }
}

/**
 * 세션 만료 체크 및 처리
 * accessToken이 만료되고 refreshToken도 없으면 로그인 페이지로 리다이렉트
 * @returns true면 세션 유효, false면 만료되어 리다이렉트 처리됨
 */
export function checkSessionAndRedirect(): boolean {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // accessToken이 있지만 만료됐고 refreshToken도 없으면 바로 로그인으로
    // (토큰이 없는 경우는 로그아웃 상태이므로 세션 만료 처리하지 않음)
    if (accessToken && isTokenExpired(accessToken) && !refreshToken) {
      // 토큰 및 사용자 정보 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user_type");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");

      // 로그인 페이지에서 토스트 표시를 위해 플래그 저장
      sessionStorage.setItem("sessionExpired", "true");
      window.location.replace("/login");
      return false;
    }

    return true;
  } catch {
    return true; // localStorage 접근 불가 시 일단 통과
  }
}
