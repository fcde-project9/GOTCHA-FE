"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface ImageViewerModalProps {
  /** 표시할 이미지 URL (null이면 모달 숨김) */
  imageUrl: string | null;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 이미지 alt 텍스트 */
  alt?: string;
}

/**
 * 이미지 확대 뷰어 모달
 * 이미지를 클릭하면 확대해서 볼 수 있는 모달 컴포넌트
 */
export function ImageViewerModal({ imageUrl, onClose, alt = "이미지" }: ImageViewerModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      onClick={onClose}
    >
      {/* 이미지 */}
      <div
        className="relative w-[327px] max-h-[70vh] rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={327}
          height={435}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="mt-7 flex items-center justify-center w-11 h-11 rounded-full bg-grey-500"
        aria-label="닫기"
      >
        <X size={24} className="stroke-white" strokeWidth={2} />
      </button>
    </div>
  );
}
