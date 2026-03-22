"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";
import { BackHeader } from "@/components/common";

interface ImagesGalleryOverlayProps {
  images: string[];
  onClose: () => void;
}

export function ImagesGalleryOverlay({ images, onClose }: ImagesGalleryOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const handleImageClick = (index: number) => {
    previousFocusRef.current = document.activeElement;
    setSelectedIndex(index);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedIndex(null);
    if (previousFocusRef.current instanceof HTMLElement) {
      previousFocusRef.current.focus();
    }
    previousFocusRef.current = null;
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleCloseModal]);

  const handlePrevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-default">
      <div className="w-full max-w-[480px] flex flex-col">
        {/* 헤더 */}
        <BackHeader onBack={onClose} />

        {/* 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[14px] text-grey-500 mb-3">총 {images.length}장</p>
          <div className="grid grid-cols-3 gap-1">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className="aspect-square overflow-hidden bg-grey-100"
              >
                <Image
                  src={imageUrl}
                  alt={`매장 사진 ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 뷰어 */}
        {selectedIndex !== null && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-[14px] text-white">
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                ref={closeButtonRef}
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center"
                aria-label="닫기"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center"
              onClick={handleCloseModal}
            >
              <Image
                src={images[selectedIndex]}
                alt={`매장 사진 ${selectedIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30"
                  aria-label="이전 이미지"
                >
                  <ChevronLeft size={28} className="text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30"
                  aria-label="다음 이미지"
                >
                  <ChevronLeft size={28} className="text-white rotate-180" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
