"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerModalProps {
  /** 표시할 이미지 URL (단일 이미지, null이면 모달 숨김) */
  imageUrl?: string | null;
  /** 표시할 이미지 URL 배열 (갤러리 모드) */
  images?: string[];
  /** 초기 이미지 인덱스 (갤러리 모드) */
  initialIndex?: number;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 이미지 alt 텍스트 */
  alt?: string;
}

/**
 * 이미지 확대 뷰어 모달 (스와이프 갤러리 지원)
 * 단일 이미지 또는 이미지 배열을 스와이프로 탐색 가능
 */
export function ImageViewerModal({
  imageUrl,
  images,
  initialIndex = 0,
  onClose,
  alt = "이미지",
}: ImageViewerModalProps) {
  // 이미지 배열 결정 (단일 이미지도 배열로 변환)
  const imageList = images ?? (imageUrl ? [imageUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 스와이프 관련 상태
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // initialIndex가 변경되면 currentIndex 업데이트
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // 이전 이미지로 이동
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // 다음 이미지로 이동
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : prev));
  }, [imageList.length]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, onClose]);

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  // 터치 종료 시 스와이프 판정
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // 스와이프 감지 임계값

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 (다음 이미지)
        goToNext();
      } else {
        // 오른쪽으로 스와이프 (이전 이미지)
        goToPrev();
      }
    }

    // 초기화
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // 이미지가 없으면 렌더링하지 않음
  if (imageList.length === 0) return null;

  const isMultiple = imageList.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      onClick={onClose}
    >
      {/* 이미지 + 버튼 컨테이너 */}
      <div className="flex items-center gap-[5px]" onClick={(e) => e.stopPropagation()}>
        {/* 이전 버튼 */}
        {isMultiple && (
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 disabled:opacity-30"
            aria-label="이전 이미지"
          >
            <ChevronLeft size={20} className="stroke-white" strokeWidth={2} />
          </button>
        )}

        {/* 이미지 컨테이너 */}
        <div
          ref={containerRef}
          className="w-[327px] max-h-[70vh] rounded-3xl overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={imageList[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            width={327}
            height={435}
            className="object-contain"
          />
        </div>

        {/* 다음 버튼 */}
        {isMultiple && (
          <button
            onClick={goToNext}
            disabled={currentIndex === imageList.length - 1}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 disabled:opacity-30"
            aria-label="다음 이미지"
          >
            <ChevronRight size={20} className="stroke-white" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 인디케이터 */}
      {isMultiple && (
        <div className="mt-4 flex items-center gap-1.5">
          {imageList.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="mt-4 flex items-center justify-center w-11 h-11 rounded-full bg-grey-500"
        aria-label="닫기"
      >
        <X size={24} className="stroke-white" strokeWidth={2} />
      </button>
    </div>
  );
}
