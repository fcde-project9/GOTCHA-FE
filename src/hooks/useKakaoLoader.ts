import { useEffect, useState } from "react";

// Singleton state to track SDK loading across all component instances
const kakaoLoaderState: {
  loading: boolean;
  loaded: boolean;
  error: string | null;
} = {
  loading: false,
  loaded: false,
  error: null,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function loadKakaoSDK(apiKey: string) {
  if (kakaoLoaderState.loaded || kakaoLoaderState.loading) {
    return;
  }

  const scriptId = "kakao-sdk-script";

  // 이미 window.kakao가 있는지 확인
  if (window.kakao && window.kakao.maps) {
    kakaoLoaderState.loaded = true;
    kakaoLoaderState.loading = false;
    notifyListeners();
    return;
  }

  // 기존 스크립트가 있는지 확인
  let script = document.getElementById(scriptId) as HTMLScriptElement;

  if (script) {
    // 스크립트가 이미 로드 완료되었는지 확인
    if (window.kakao && window.kakao.maps) {
      kakaoLoaderState.loaded = true;
      kakaoLoaderState.loading = false;
      notifyListeners();
    } else {
      // 스크립트가 로드 중
      kakaoLoaderState.loading = true;
    }
    return;
  }

  // 새 스크립트 생성
  kakaoLoaderState.loading = true;
  script = document.createElement("script");
  script.id = scriptId;
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
  script.async = true;

  script.onload = () => {
    kakaoLoaderState.loaded = true;
    kakaoLoaderState.loading = false;
    notifyListeners();
  };

  script.onerror = () => {
    kakaoLoaderState.error = "카카오맵 SDK 로드에 실패했어요.";
    kakaoLoaderState.loading = false;
    notifyListeners();
  };

  document.head.appendChild(script);
}

/**
 * 카카오맵 SDK를 로드하는 커스텀 훅
 * 여러 컴포넌트 인스턴스에서 사용해도 SDK는 한 번만 로드됩니다
 */
export function useKakaoLoader() {
  const [state, setState] = useState(kakaoLoaderState);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!apiKey) {
      setState({
        loading: false,
        loaded: false,
        error: "카카오맵 API 키가 설정되지 않았어요.",
      });
      return;
    }

    // 현재 상태를 컴포넌트 state에 동기화
    setState(kakaoLoaderState);

    // 상태 변경 리스너 등록
    const listener = () => {
      setState({ ...kakaoLoaderState });
    };
    listeners.add(listener);

    // SDK 로드 시작
    loadKakaoSDK(apiKey);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}
