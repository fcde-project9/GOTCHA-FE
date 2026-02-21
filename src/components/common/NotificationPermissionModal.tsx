"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { trackNotificationPermission } from "@/utils/analytics";
import { isNativeApp } from "@/utils/platform";
import { checkNativePushPermission } from "@/utils/pushNotifications";
import { Button } from "./Button";

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

/**
 * 알림 권한 요청 모달
 *
 * 표준 준수:
 * - .ai/modal_and_permission_standards.md 참조
 * - Body 스크롤 방지
 * - 접근성 속성 (role, aria-*)
 * - 브라우저별 설정 안내 (웹 전용)
 * - 네이티브 앱: Capacitor PushNotifications 플러그인 사용
 * - 오버레이/ESC/X 닫기 비활성화 (명시적 버튼 선택 유도)
 */
export function NotificationPermissionModal({
  isOpen,
  onClose,
  onPermissionGranted,
}: NotificationPermissionModalProps) {
  const [settingsGuide, setSettingsGuide] = useState<string>("");
  const [permissionState, setPermissionState] = useState<"granted" | "denied" | "prompt" | null>(
    null
  );
  const [isRequesting, setIsRequesting] = useState(false);

  // Body 스크롤 방지 (표준 준수)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // 브라우저별 설정 안내 텍스트 생성 (웹 전용)
  useEffect(() => {
    if (isNativeApp()) {
      setSettingsGuide("설정 앱 → GOTCHA! → 알림에서 '허용'으로 변경해주세요.");
      return;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    let guide = "";

    if (isIOS) {
      guide = "설정 앱 → Safari → 알림에서 '허용'으로 변경해주세요.";
    } else if (isAndroid && userAgent.includes("chrome")) {
      guide = "주소창 왼쪽 자물쇠 아이콘 → 권한 → 알림에서 '허용'으로 변경해주세요.";
    } else if (userAgent.includes("chrome")) {
      guide = "주소창 왼쪽 자물쇠 아이콘 → 사이트 설정 → 알림에서 권한을 허용해주세요.";
    } else if (userAgent.includes("safari")) {
      guide = "Safari 설정 → 웹사이트 → 알림에서 권한을 허용해주세요.";
    } else if (userAgent.includes("firefox")) {
      guide = "주소창 왼쪽 아이콘 → 권한 → 알림에서 권한을 허용해주세요.";
    } else {
      guide = "브라우저 설정에서 알림 권한을 허용해주세요.";
    }

    setSettingsGuide(guide);
  }, []);

  // 모달 열릴 때 현재 권한 상태 확인 (네이티브/웹 통합)
  useEffect(() => {
    if (!isOpen) return;

    checkNativePushPermission().then(setPermissionState);
  }, [isOpen]);

  // 알림 권한 요청 (네이티브/웹 분기)
  const requestNotification = useCallback(async () => {
    setIsRequesting(true);

    try {
      if (isNativeApp()) {
        // 네이티브: Capacitor PushNotifications 사용
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const result = await PushNotifications.requestPermissions();
        const granted = result.receive === "granted";
        setPermissionState(granted ? "granted" : "denied");
        trackNotificationPermission(granted);

        if (granted) {
          onPermissionGranted?.();
          onClose();
        }
      } else {
        // 웹: Notification API 사용
        if (typeof Notification === "undefined") {
          setPermissionState("denied");
          return;
        }
        const result = await Notification.requestPermission();
        const state = result === "default" ? "prompt" : result;
        setPermissionState(state);
        trackNotificationPermission(result === "granted");

        if (result === "granted") {
          onPermissionGranted?.();
          onClose();
        }
      }
    } catch {
      setPermissionState("denied");
      trackNotificationPermission(false);
    } finally {
      setIsRequesting(false);
    }
  }, [onClose, onPermissionGranted]);

  if (!isOpen) return null;

  const isDenied = permissionState === "denied";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* 모달 컨텐츠 */}
      <div
        role="dialog"
        aria-labelledby="notification-permission-title"
        aria-describedby="notification-permission-description"
        className="relative z-10 mx-5 w-full max-w-[340px] rounded-2xl bg-white p-6"
      >
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-error/10">
            <Bell size={32} className="stroke-error" strokeWidth={2} />
          </div>
        </div>

        {/* 제목 */}
        <h2
          id="notification-permission-title"
          className="mb-2 text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900"
        >
          알림을 받아보세요
        </h2>

        {/* 설명 */}
        <p
          id="notification-permission-description"
          className="mb-4 text-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600"
        >
          새로운 매장 정보와 이벤트 소식을
          <br />
          가장 먼저 받아보세요.
        </p>

        {/* 권한이 완전히 차단된 경우 설정 안내 표시 */}
        {isDenied && (
          <div className="mb-6 rounded-lg bg-grey-50 p-4">
            <p className="text-[13px] font-medium leading-[1.6] tracking-[-0.13px] text-grey-700">
              🔔 설정 방법
            </p>
            <p className="mt-2 text-[13px] font-normal leading-[1.6] tracking-[-0.13px] text-grey-600">
              {settingsGuide}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          {!isDenied ? (
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onClick={requestNotification}
              disabled={isRequesting}
            >
              {isRequesting ? "확인 중..." : "알림 받기"}
            </Button>
          ) : (
            <Button variant="secondary" size="medium" fullWidth onClick={onClose}>
              확인
            </Button>
          )}
          {!isDenied && (
            <Button variant="tertiary" size="medium" fullWidth onClick={onClose}>
              나중에
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
