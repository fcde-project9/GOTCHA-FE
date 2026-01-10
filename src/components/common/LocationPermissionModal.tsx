"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, X } from "lucide-react";
import { Button } from "./Button";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: (position: GeolocationPosition) => void;
  /** 이미 권한이 거부된 상태로 모달을 열 때 true */
  initialDenied?: boolean;
}

/**
 * 위치 권한 요청 모달
 *
 * 표준 준수:
 * - .ai/modal_and_permission_standards.md 참조
 * - ESC 키로 닫기
 * - 오버레이 클릭으로 닫기
 * - Body 스크롤 방지
 * - 접근성 속성 (role, aria-*)
 * - 브라우저별 설정 안내
 * - Permissions API 미지원 환경 대응
 */
export function LocationPermissionModal({
  isOpen,
  onClose,
  onPermissionGranted,
  initialDenied = false,
}: LocationPermissionModalProps) {
  const [settingsGuide, setSettingsGuide] = useState<string>("");
  const [permissionState, setPermissionState] = useState<PermissionState | null>(
    initialDenied ? "denied" : null
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const requestLocationRef = useRef<() => void>(() => {});

  // ESC 키로 모달 닫기 (표준 준수)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지 (표준 준수)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // 브라우저별 설정 안내 텍스트 생성 (한 번만 실행)
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    let guide = "";

    if (isIOS) {
      guide = "설정 앱 → Safari → 위치에서 '허용'으로 변경해주세요.";
    } else if (isAndroid && userAgent.includes("chrome")) {
      guide = "주소창 왼쪽 자물쇠 아이콘 → 권한 → 위치에서 '허용'으로 변경해주세요.";
    } else if (userAgent.includes("chrome")) {
      guide = "주소창 왼쪽 자물쇠 아이콘 → 사이트 설정 → 위치에서 권한을 허용해주세요.";
    } else if (userAgent.includes("safari")) {
      guide = "Safari 설정 → 웹사이트 → 위치 정보에서 권한을 허용해주세요.";
    } else if (userAgent.includes("firefox")) {
      guide = "주소창 왼쪽 아이콘 → 권한 → 위치에서 권한을 허용해주세요.";
    } else {
      guide = "브라우저 설정에서 위치 권한을 허용해주세요.";
    }

    setSettingsGuide(guide);
  }, []);

  // 권한 상태 확인 (모달이 열릴 때만 리스너 등록)
  useEffect(() => {
    if (!isOpen) return;

    let permissionStatus: PermissionStatus | null = null;
    let isMounted = true;

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (!isMounted) return;

          permissionStatus = result;
          setPermissionState(result.state);

          // 이미 권한이 허용된 경우 바로 위치 요청
          if (result.state === "granted") {
            requestLocationRef.current();
            return;
          }

          // 권한 상태 변경 감지
          result.onchange = () => {
            if (!isMounted) return;
            setPermissionState(result.state);
            // 권한이 허용되면 자동으로 위치 요청
            if (result.state === "granted") {
              requestLocationRef.current();
            }
          };
        })
        .catch((error) => {
          // Permissions API 에러 처리 (일부 브라우저에서 지원하지 않을 수 있음)
          console.warn("Permissions API error:", error);
        });
    }

    return () => {
      isMounted = false;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [isOpen]);

  // 위치 권한 다시 요청
  const requestLocation = useCallback(() => {
    setIsRequesting(true);

    // Geolocation API 미지원 환경 체크
    if (!("geolocation" in navigator)) {
      setIsRequesting(false);
      setPermissionState("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        onPermissionGranted?.(position);
        onClose();
      },
      (error) => {
        setIsRequesting(false);
        // Permissions API 미지원 환경에서도 UX가 동작하도록 보정
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
        // 여전히 거부됨 - 설정 안내 계속 표시
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onClose, onPermissionGranted]);

  // ref를 최신 requestLocation으로 유지
  useEffect(() => {
    requestLocationRef.current = requestLocation;
  }, [requestLocation]);

  const handleRequestPermission = () => {
    // 권한이 "prompt" 상태면 다시 요청 가능
    // "denied" 상태면 브라우저 설정에서 변경해야 함
    requestLocation();
  };

  if (!isOpen) return null;

  const isDenied = permissionState === "denied";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* 모달 컨텐츠 */}
      <div
        role="dialog"
        aria-labelledby="location-permission-title"
        aria-describedby="location-permission-description"
        className="relative z-10 mx-5 w-full max-w-[340px] rounded-2xl bg-white p-6"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-6 items-center justify-center"
          aria-label="닫기"
        >
          <X size={20} className="stroke-grey-600" strokeWidth={2} />
        </button>

        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-error/10">
            <MapPin size={32} className="stroke-error" strokeWidth={2} />
          </div>
        </div>

        {/* 제목 */}
        <h2
          id="location-permission-title"
          className="mb-2 text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900"
        >
          위치 권한이 필요해요
        </h2>

        {/* 설명 */}
        <p
          id="location-permission-description"
          className="mb-4 text-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600"
        >
          내 주변 매장을 찾기 위해
          <br />
          위치 권한이 필요합니다.
        </p>

        {/* 권한이 완전히 차단된 경우 설정 안내 표시 */}
        {isDenied && (
          <div className="mb-6 rounded-lg bg-grey-50 p-4">
            <p className="text-[13px] font-medium leading-[1.6] tracking-[-0.13px] text-grey-700">
              📍 설정 방법
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
              onClick={handleRequestPermission}
              disabled={isRequesting}
            >
              {isRequesting ? "확인 중..." : "위치 권한 허용하기"}
            </Button>
          ) : (
            <Button variant="secondary" size="medium" fullWidth onClick={onClose}>
              확인
            </Button>
          )}
          {!isDenied && (
            <Button variant="ghost" size="medium" fullWidth onClick={onClose}>
              나중에
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
