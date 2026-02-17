"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { NotificationPermissionModal } from "@/components/common";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { ToastProvider } from "@/hooks";
import { checkSessionAndRedirect } from "@/utils";

// 세션 체크를 하지 않는 페이지 목록
const PUBLIC_PATHS = ["/login", "/oauth/callback", "/login/nickname", "/terms"];

const NOTIFICATION_DISMISSED_KEY = "notificationPermissionDismissed";

/** VAPID 공개키를 가져와서 Push 구독을 등록하고 백엔드에 전송 */
async function registerPushSubscription() {
  const registration = await navigator.serviceWorker.ready;

  // 이미 구독 중이면 스킵
  const existing = await registration.pushManager.getSubscription();
  if (existing) return;

  // 백엔드에서 VAPID 공개키 조회
  const { data } = await apiClient.get(ENDPOINTS.PUSH.VAPID_KEY);
  const vapidPublicKey = data.data.publicKey;

  // Base64 → Uint8Array 변환
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
  };

  // Push 구독 생성
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // 백엔드에 구독 정보 전송
  const json = subscription.toJSON();
  await apiClient.post(ENDPOINTS.PUSH.SUBSCRIBE, {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // 모든 페이지에서 세션 만료 체크
  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`)
    );
    if (!isPublicPath) {
      checkSessionAndRedirect();
    }
  }, [pathname]);

  // 알림 권한 모달 표시 조건 확인
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;

    try {
      if (localStorage.getItem(NOTIFICATION_DISMISSED_KEY) === "true") return;
    } catch {
      return;
    }

    setShowNotificationModal(true);
  }, []);

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
    // 권한 허용 후 push 구독 등록
    registerPushSubscription().catch(() => {
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
