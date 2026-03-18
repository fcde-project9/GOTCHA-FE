"use client";

import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { isNativeApp } from "@/utils/platform";
import { Button } from "./Button";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 위치 권한 설정 안내 모달
 *
 * 표준 준수:
 * - .ai/modal_and_permission_standards.md 참조
 * - ESC 키로 닫기
 * - 오버레이 클릭으로 닫기
 * - Body 스크롤 방지
 * - 접근성 속성 (role, aria-*)
 * - 브라우저별 설정 안내
 */
export function LocationPermissionModal({ isOpen, onClose }: LocationPermissionModalProps) {
  const [settingsGuide, setSettingsGuide] = useState<string>("");

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
    if (isNativeApp()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 브라우저 환경 감지 후 초기값 설정
      setSettingsGuide("설정 앱 → GOTCHA! → 위치에서 '허용'으로 변경해주세요.");
      return;
    }

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

  if (!isOpen) return null;

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
          위치 권한이 필요해요.
        </p>

        {/* 설정 안내 */}
        <div className="mb-6 rounded-lg bg-grey-50 p-4">
          <p className="text-[13px] font-medium leading-[1.6] tracking-[-0.13px] text-grey-700">
            📍 설정 방법
          </p>
          <p className="mt-2 text-[13px] font-normal leading-[1.6] tracking-[-0.13px] text-grey-600">
            {settingsGuide}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="medium" fullWidth onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
