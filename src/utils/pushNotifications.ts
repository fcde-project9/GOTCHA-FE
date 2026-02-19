import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { isNativeApp, getPlatform } from "./platform";

/**
 * 웹 환경: VAPID 기반 Web Push 구독 등록
 */
async function registerWebPush() {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    // 이미 구독 중이면 스킵
    const existing = await registration.pushManager.getSubscription();
    if (existing) return;

    // 백엔드에서 VAPID 공개키 조회
    const { data } = await apiClient.get(ENDPOINTS.PUSH.VAPID_KEY);
    const vapidPublicKey = data.data?.publicKey;
    if (!vapidPublicKey) return;

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
  } catch (err) {
    console.error("Web push registration failed:", err);
  }
}

/**
 * 네이티브 환경: APNS/FCM 토큰 획득 후 백엔드 등록
 */
async function registerNativePush() {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  // 권한 요청
  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== "granted") return;

  // 푸시 알림 등록
  await PushNotifications.register();

  // 토큰 수신 리스너 (일회성: 수신 후 즉시 제거하여 중복 방지)
  const regHandle = await PushNotifications.addListener("registration", async (token) => {
    await regHandle.remove();
    try {
      await apiClient.post(ENDPOINTS.PUSH.REGISTER_DEVICE, {
        token: token.value,
        platform: getPlatform(),
      });
    } catch {
      // 등록 실패해도 앱 동작에 영향 없음
    }
  });

  // 토큰 등록 실패 리스너 (일회성)
  const errHandle = await PushNotifications.addListener("registrationError", async (error) => {
    await errHandle.remove();
    console.error("Push registration error:", error);
  });
}

/**
 * 플랫폼에 따라 적절한 푸시 알림 등록 실행
 */
export async function registerPushNotifications(): Promise<void> {
  if (isNativeApp()) {
    await registerNativePush();
  } else {
    await registerWebPush();
  }
}

/**
 * 네이티브 푸시 알림 권한 상태 확인
 */
export async function checkNativePushPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (!isNativeApp()) {
    if (typeof Notification === "undefined") return "denied";
    return Notification.permission === "default" ? "prompt" : Notification.permission;
  }

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const result = await PushNotifications.checkPermissions();
  switch (result.receive) {
    case "granted":
      return "granted";
    case "denied":
      return "denied";
    default:
      return "prompt";
  }
}
