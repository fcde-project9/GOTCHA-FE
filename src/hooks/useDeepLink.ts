"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { isNativeApp } from "@/utils/platform";

/**
 * 딥링크(커스텀 URL 스킴) 이벤트를 리스닝하여 앱 내 라우팅 처리
 *
 * gotchaapp://oauth/callback?code=...&state=... 형태의 딥링크를 처리하여
 * /oauth/callback 페이지로 내부 네비게이션
 */
export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;

    const handleUrlOpen = async (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);

      // 인앱 브라우저 닫기 (OAuth 완료 후)
      try {
        await Browser.close();
      } catch {
        // 브라우저가 열려있지 않을 수 있음
      }

      // gotchaapp://oauth/callback → /oauth/callback
      const path = url.pathname || url.hostname + url.pathname;
      const search = url.search;

      if (path.includes("oauth/callback")) {
        router.replace(`/oauth/callback${search}`);
      }
    };

    App.addListener("appUrlOpen", handleUrlOpen);

    return () => {
      App.removeAllListeners();
    };
  }, [router]);
}
