"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[]; // 스냅 포인트 (픽셀 단위)
  defaultSnapPoint?: number; // 기본 스냅 포인트 인덱스
  onHeightChange?: (height: number, isDragging: boolean) => void; // 높이 변경 콜백 (isDragging 추가)
  scrollToTop?: number; // 스크롤을 맨 위로 이동시키기
}

/**
 * Get default snap points with SSR-safe window height calculation
 */
function getDefaultSnapPoints(): number[] {
  if (typeof window !== "undefined") {
    return [215, 400, window.innerHeight - 100];
  }
  // SSR fallback: use reasonable defaults
  return [215, 400, 700];
}

export default function BottomSheet({
  children,
  snapPoints,
  defaultSnapPoint = 0,
  onHeightChange,
  scrollToTop,
}: BottomSheetProps) {
  // Compute snapPoints client-side if not provided (memoized to prevent recreation)
  const computedSnapPoints = useMemo(() => snapPoints ?? getDefaultSnapPoints(), [snapPoints]);

  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentHeight = isDragging
    ? Math.max(
        computedSnapPoints[0],
        Math.min(
          computedSnapPoints[computedSnapPoints.length - 1],
          computedSnapPoints[currentSnapIndex] - (currentY - startY)
        )
      )
    : computedSnapPoints[currentSnapIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;
    const newHeight = computedSnapPoints[currentSnapIndex] - deltaY;

    // 가장 가까운 스냅 포인트 찾기
    let closestIndex = 0;
    let minDiff = Math.abs(newHeight - computedSnapPoints[0]);

    computedSnapPoints.forEach((point, index) => {
      const diff = Math.abs(newHeight - point);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    setCurrentSnapIndex(closestIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;
    const newHeight = computedSnapPoints[currentSnapIndex] - deltaY;

    let closestIndex = 0;
    let minDiff = Math.abs(newHeight - computedSnapPoints[0]);

    computedSnapPoints.forEach((point, index) => {
      const diff = Math.abs(newHeight - point);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    setCurrentSnapIndex(closestIndex);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, currentY, startY, currentSnapIndex, computedSnapPoints]);

  // 높이 변경 시 콜백 호출
  useEffect(() => {
    if (onHeightChange) {
      onHeightChange(currentHeight, isDragging);
    }
  }, [currentHeight, isDragging, onHeightChange]);

  // 스크롤을 맨 위로 이동 (scrollToTop 값이 변경될 때마다)
  useEffect(() => {
    if (scrollToTop !== undefined && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [scrollToTop]);

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] overflow-hidden z-10"
      style={{
        height: `${currentHeight - 72}px`,
        transition: isDragging ? "none" : "height 0.3s ease-out",
      }}
    >
      {/* Grabber */}
      <div
        className="flex items-center justify-center h-[34px] cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="w-[80px] h-[4px] bg-[#cfcfcf] rounded-[2px]" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="overflow-y-auto h-[calc(100%-44px)]">
        {children}
      </div>
    </div>
  );
}
