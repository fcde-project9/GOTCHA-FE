"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * 토스트 메시지 컴포넌트
 * 화면 하단에 일정 시간 동안 메시지를 표시합니다.
 */
export function Toast({ message, isVisible, onClose, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 약간의 딜레이 후 fade-in 시작
      setTimeout(() => setShow(true), 10);

      const timer = setTimeout(() => {
        setShow(false);
        // fade-out 애니메이션 후 onClose 호출
        setTimeout(() => onClose(), 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-[100px] left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-grey-700 rounded-xl px-6 py-3 shadow-lg">
        <p className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-white whitespace-nowrap">
          {message}
        </p>
      </div>
    </div>
  );
}
