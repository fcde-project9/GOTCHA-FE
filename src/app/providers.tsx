"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NotificationPermissionModal } from "@/components/common";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { ToastProvider, useDeepLink } from "@/hooks";
import { checkSessionAndRedirect } from "@/utils";
import { isNativeApp } from "@/utils/platform";
import { registerPushNotifications, checkNativePushPermission } from "@/utils/pushNotifications";

// 세션 체크를 하지 않는 페이지 목록
const PUBLIC_PATHS = ["/login", "/oauth/callback", "/login/nickname", "/terms"];

const NOTIFICATION_DISMISSED_KEY = "notificationPermissionDismissed";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

        // 키보드: 리사이즈 모드 (키보드가 올라와도 레이아웃이 밀리지 않도록 None으로 설정)
        await Keyboard.setResizeMode({ mode: KeyboardResize.None });
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

  // 알림 권한 모달 표시 조건 확인 (인증된 페이지에서만)
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );
    if (isPublicPath) return;

    const checkPermission = async () => {
      // Capacitor API로 권한 확인 (타임아웃 2초)
      let permission: "granted" | "denied" | "prompt";
      try {
        permission = await Promise.race([
          checkNativePushPermission(),
          new Promise<"prompt">((resolve) => setTimeout(() => resolve("prompt"), 2000)),
        ]);
      } catch {
        permission = "prompt";
      }

      if (permission === "granted") return;
      // 웹에서는 denied면 모달 표시하지 않음
      if (!isNativeApp() && permission === "denied") return;

      try {
        if (localStorage.getItem(NOTIFICATION_DISMISSED_KEY) === "true") return;
        if (localStorage.getItem("notificationPermissionGranted") === "true") return;
      } catch {
        return;
      }

      setShowNotificationModal(true);
    };

    checkPermission();
  }, [pathname]);

  const handleNotificationClose = useCallback(() => {
    // "나중에" 클릭 시 localStorage에 플래그 저장
    try {
      localStorage.setItem(NOTIFICATION_DISMISSED_KEY, "true");
    } catch {
      // localStorage 접근 불가 시 무시
    }
    setShowNotificationModal(false);
  }, []);

  const handleNotificationGranted = useCallback(() => {
    setShowNotificationModal(false);
    // 권한 허용 후 push 구독 등록 (웹/네이티브 자동 분기)
    // 등록 성공 시에만 granted 플래그 저장 (실패 시 다음에 재시도 가능)
    registerPushNotifications()
      .then(() => {
        try {
          localStorage.setItem("notificationPermissionGranted", "true");
        } catch {
          /* noop */
        }
      })
      .catch(() => {
        // 구독 실패해도 앱 동작에 영향 없음
      });
  }, []);

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
      <NotificationPermissionModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
        onPermissionGranted={handleNotificationGranted}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
