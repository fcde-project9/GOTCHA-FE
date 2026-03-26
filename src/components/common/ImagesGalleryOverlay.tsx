"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";
import { BackHeader, Spinner } from "@/components/common";

interface ImagesGalleryOverlayProps {
  images: string[];
  onClose: () => void;
  totalCount?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export function ImagesGalleryOverlay({
  images,
  onClose,
  totalCount,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: ImagesGalleryOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const hasMoved = useRef(false);

  // 핀치 줌 관련
  const initialPinchDistance = useRef<number | null>(null);
  const pinchScaleStart = useRef(1);
  const isPinching = useRef(false);

  // 팬(이동) 관련
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // 더블탭 관련
  const lastTapTime = useRef(0);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // 이미지 뷰어 열릴 때 타이머 시작, 닫힐 때 정리
  useEffect(() => {
    if (selectedIndex !== null) {
      resetHideTimer();
    } else {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [selectedIndex, resetHideTimer]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handleImageClick = (index: number) => {
    previousFocusRef.current = document.activeElement;
    setSelectedIndex(index);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedIndex(null);
    resetZoom();
    if (previousFocusRef.current instanceof HTMLElement) {
      previousFocusRef.current.focus();
    }
    previousFocusRef.current = null;
  }, [resetZoom]);

  useEffect(() => {
    if (selectedIndex === null) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleCloseModal]);

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePrevImage = () => {
    if (selectedIndex === null) return;
    resetZoom();
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    if (selectedIndex === null) return;
    resetZoom();
    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 핀치 시작
      isPinching.current = true;
      initialPinchDistance.current = getPinchDistance(e.touches);
      pinchScaleStart.current = scale;
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
      hasMoved.current = false;

      if (scale > 1) {
        // 줌인 상태: 팬 시작
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        translateStart.current = { ...translate };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      // 핀치 줌
      const currentDistance = getPinchDistance(e.touches);
      const newScale = Math.min(
        Math.max(pinchScaleStart.current * (currentDistance / initialPinchDistance.current), 1),
        4
      );
      setScale(newScale);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
      hasMoved.current = true;
    } else if (e.touches.length === 1 && !isPinching.current) {
      touchEndX.current = e.touches[0].clientX;
      hasMoved.current = true;

      if (scale > 1) {
        // 줌인 상태: 팬
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching.current) {
      // 핀치 종료
      if (e.touches.length < 2) {
        isPinching.current = false;
        initialPinchDistance.current = null;
        if (scale <= 1) resetZoom();
      }
      return;
    }

    if (scale > 1) {
      // 줌인 상태에서는 스와이프/탭 무시
      hasMoved.current = false;
      return;
    }

    if (hasMoved.current) {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        resetHideTimer();
        if (diff > 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }
    } else {
      // 더블탭 줌
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2);
        }
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      // 싱글탭 → 컨트롤 토글 (더블탭 대기 후)
      setTimeout(() => {
        if (lastTapTime.current !== 0) {
          setShowControls((prev) => {
            const next = !prev;
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            if (next) {
              hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
            }
            return next;
          });
        }
      }, 300);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    hasMoved.current = false;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-default h-safe-viewport">
      <div className="w-full max-w-[480px] flex flex-col">
        {/* 헤더 */}
        <BackHeader onBack={onClose} />

        {/* 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[14px] text-grey-500 mb-3">총 {totalCount ?? images.length}장</p>
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
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && <Spinner />}
            </div>
          )}
        </div>

        {/* 이미지 뷰어 */}
        {selectedIndex !== null && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 bg-black h-safe-viewport"
          >
            <div
              className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <span className="text-[14px] text-white">
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                ref={closeButtonRef}
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center outline-none"
                aria-label="닫기"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="relative w-full h-full transition-transform duration-100"
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                }}
              >
                <Image
                  src={images[selectedIndex]}
                  alt={`매장 사진 ${selectedIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  draggable={false}
                />
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetHideTimer();
                    handlePrevImage();
                  }}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  aria-label="이전 이미지"
                >
                  <ChevronLeft size={28} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetHideTimer();
                    handleNextImage();
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
