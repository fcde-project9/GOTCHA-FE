"use client";

import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { Button } from "./Button";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 위치 권한 요청 모달
 * 사용자가 위치 권한을 거부했을 때 다시 허용을 유도하는 모달
 */
export function LocationPermissionModal({ isOpen, onClose }: LocationPermissionModalProps) {
  const [settingsGuide, setSettingsGuide] = useState<string>("");

  useEffect(() => {
    // 브라우저별 설정 안내 텍스트 생성
    const userAgent = navigator.userAgent.toLowerCase();
    let guide = "";

    if (userAgent.includes("chrome")) {
      guide = "Chrome 설정 → 개인정보 및 보안 → 사이트 설정 → 위치에서 권한을 허용해주세요.";
    } else if (userAgent.includes("safari")) {
      guide = "Safari 설정 → 웹사이트 → 위치 정보에서 권한을 허용해주세요.";
    } else if (userAgent.includes("firefox")) {
      guide = "Firefox 설정 → 개인정보 및 보안 → 권한 → 위치에서 권한을 허용해주세요.";
    } else {
      guide = "브라우저 설정에서 위치 권한을 허용해주세요.";
    }

    setSettingsGuide(guide);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 mx-5 w-full max-w-[340px] rounded-2xl bg-white p-6">
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
        <h2 className="mb-2 text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900">
          위치 권한이 필요해요
        </h2>

        {/* 설명 */}
        <p className="mb-4 text-center text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-600">
          내 주변 매장을 찾기 위해
          <br />
          위치 권한이 필요합니다.
        </p>

        {/* 설정 안내 박스 */}
        <div className="mb-6 rounded-lg bg-grey-50 p-4">
          <p className="text-[13px] font-medium leading-[1.6] tracking-[-0.13px] text-grey-700">
            📍 설정 방법
          </p>
          <p className="mt-2 text-[13px] font-normal leading-[1.6] tracking-[-0.13px] text-grey-600">
            {settingsGuide}
          </p>
        </div>

        {/* 확인 버튼 */}
        <Button variant="secondary" size="medium" fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
