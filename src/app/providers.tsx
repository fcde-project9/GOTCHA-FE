"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { ToastProvider, useDeepLink } from "@/hooks";
import { checkSessionAndRedirect } from "@/utils";
import { isNativeApp } from "@/utils/platform";
import { registerPushNotifications } from "@/utils/pushNotifications";

// 세션 체크를 하지 않는 페이지 목록
const PUBLIC_PATHS = ["/login", "/oauth/callback", "/login/nickname", "/terms"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const permissionsRequestedRef = useRef(false);

  // 딥링크(gotchaapp://) 이벤트 리스닝
  useDeepLink();

  // 네이티브 앱 초기화 (StatusBar, SplashScreen, Keyboard)
  useEffect(() => {
    if (!isNativeApp()) return;

    const initNativeApp = async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");

        // 상태바: 어두운 텍스트 (밝은 배경)
        await StatusBar.setStyle({ style: Style.Light });

        // 키보드: 리사이즈 모드 (기본값인 Body로 복구하여 입력창 가림 방지)
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      } finally {
        // import/초기화 실패 시에도 스플래시는 반드시 숨기기
        try {
          const { SplashScreen } = await import("@capacitor/splash-screen");
          await SplashScreen.hide();
        } catch {
          // SplashScreen import 자체가 실패하면 무시
        }
      }
    };

    initNativeApp().catch(console.error);
  }, []);

  // 모든 페이지에서 세션 만료 체크
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );
    if (!isPublicPath) {
      checkSessionAndRedirect();
    }
  }, [pathname]);

  // 순차적 권한 요청: 위치 → 알림 (시스템 다이얼로그 사용, 1회만 실행)
  useEffect(() => {
    if (permissionsRequestedRef.current) return;

    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );
    if (isPublicPath) return;

    // 인증 확인 (미인증 시 권한 요청 스킵)
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userType = localStorage.getItem("user_type");
      if (!accessToken && userType !== "guest") return;
    } catch {
      return;
    }

    permissionsRequestedRef.current = true;

    const requestSequentialPermissions = async () => {
      if (isNativeApp()) {
        try {
          // 1. 위치 권한 (시스템 다이얼로그)
          const { Geolocation } = await import("@capacitor/geolocation");
          const locPerm = await Geolocation.checkPermissions();
          if (locPerm.location !== "granted" && locPerm.location !== "denied") {
            await Geolocation.requestPermissions();
          }

          // 2. 알림 권한 (시스템 다이얼로그)
          const { PushNotifications } = await import("@capacitor/push-notifications");
          const notifPerm = await PushNotifications.checkPermissions();
          if (notifPerm.receive !== "granted" && notifPerm.receive !== "denied") {
            const result = await PushNotifications.requestPermissions();
            if (result.receive === "granted") {
              registerPushNotifications().catch(() => {});
            }
          }
        } catch {
          // 권한 요청 실패 시 무시
        }
      } else {
        // 웹: 알림 권한만 시스템 팝업으로 요청
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "default") {
            const result = await Notification.requestPermission();
            if (result === "granted") {
              registerPushNotifications().catch(() => {});
            }
          }
        } catch {
          // ignore
        }
      }

      // 권한 요청 완료 → useLocationTracking이 위치 재조회
      window.dispatchEvent(new Event("permissions-ready"));
    };

    requestSequentialPermissions();
  }, [pathname]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            retry: 1,
            refetchOnWindowFocus: true, // 탭 복귀 시 자동 갱신
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
      <ServiceWorkerRegistration />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
