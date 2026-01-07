import { useRouter } from "next/navigation";

export type OAuthProvider = "kakao" | "naver" | "google";

interface UseOAuthReturn {
  loginWithKakao: () => void;
  loginWithNaver: () => void;
  loginWithGoogle: () => void;
}

export const useOAuth = (): UseOAuthReturn => {
  const router = useRouter();

  const handleOAuthCallback = async (
    provider: OAuthProvider,
    accessToken: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/${provider}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        router.push("/map");
      } else {
        throw new Error("인증 실패");
      }
    } catch (error) {
      console.error(`${provider} 인증 처리 실패`, error);
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  const loginWithKakao = () => {
    if (!window.Kakao) {
      alert("카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj: KakaoAuthResponse) => {
        console.log("카카오 로그인 성공", authObj);
        handleOAuthCallback("kakao", authObj.access_token);
      },
      fail: (err: Error) => {
        console.error("카카오 로그인 실패", err);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  const loginWithNaver = () => {
    // 네이버 로그인은 팝업 방식
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/login/naver/callback`
    );
    const state = Math.random().toString(36).substring(2);

    // 상태값 저장
    sessionStorage.setItem("naver_state", state);

    // 네이버 로그인 페이지로 리다이렉트
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  const loginWithGoogle = () => {
    // 구글 로그인은 OAuth2 팝업 방식
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/login/google/callback`
    );

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  return {
    loginWithKakao,
    loginWithNaver,
    loginWithGoogle,
  };
};
