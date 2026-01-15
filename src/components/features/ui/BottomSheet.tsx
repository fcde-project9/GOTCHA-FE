"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[]; // 스냅 포인트 (픽셀 단위)
  defaultSnapPoint?: number; // 기본 스냅 포인트 인덱스
  onHeightChange?: (height: number, isDragging: boolean) => void; // 높이 변경 콜백 (isDragging 추가)
  scrollToTop?: number; // 스크롤을 맨 위로 이동시키기
}

/** 확장 시 상단에서 유지할 여백 (검색창 + 재검색 버튼 영역) */
const EXPANDED_TOP_MARGIN = 14;

export default function BottomSheet({
  children,
  snapPoints,
  defaultSnapPoint = 0,
  onHeightChange,
  scrollToTop,
}: BottomSheetProps) {
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 컨테이너 높이 측정
  const measureContainer = useCallback(() => {
    if (sheetRef.current?.parentElement) {
      setContainerHeight(sheetRef.current.parentElement.clientHeight);
    }
  }, []);

  // 마운트 시 및 리사이즈 시 컨테이너 높이 측정
  useEffect(() => {
    measureContainer();
    window.addEventListener("resize", measureContainer);
    return () => window.removeEventListener("resize", measureContainer);
  }, [measureContainer]);

  // 컨테이너 높이 기반으로 스냅 포인트 계산
  const computedSnapPoints = useMemo(() => {
    if (snapPoints) return snapPoints;

    // 컨테이너 높이가 측정되기 전에는 기본값 사용
    const expandedHeight = containerHeight ? containerHeight - EXPANDED_TOP_MARGIN : 715;

    return [106, 290, expandedHeight];
  }, [snapPoints, containerHeight]);

  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
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
    const threshold = 30; // 드래그 임계값 (px)

    let newIndex = currentSnapIndex;

    if (deltaY > threshold) {
      // 아래로 드래그
      if (currentSnapIndex === computedSnapPoints.length - 1) {
        // 맨 위에서 내리면 → 가운데로 (default)
        newIndex = 1;
      } else {
        // 그 외에는 → 최소 상태로 (collapsed)
        newIndex = 0;
      }
    } else if (deltaY < -threshold) {
      // 위로 드래그
      if (currentSnapIndex === 0) {
        // 맨 아래에서 올리면 → 가운데로 (default)
        newIndex = 1;
      } else {
        // 그 외에는 → 최대 상태로 (expanded)
        newIndex = computedSnapPoints.length - 1;
      }
    }

    setCurrentSnapIndex(newIndex);
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
    const threshold = 30; // 드래그 임계값 (px)

    let newIndex = currentSnapIndex;

    if (deltaY > threshold) {
      // 아래로 드래그
      if (currentSnapIndex === computedSnapPoints.length - 1) {
        // 맨 위에서 내리면 → 가운데로 (default)
        newIndex = 1;
      } else {
        // 그 외에는 → 최소 상태로 (collapsed)
        newIndex = 0;
      }
    } else if (deltaY < -threshold) {
      // 위로 드래그
      if (currentSnapIndex === 0) {
        // 맨 아래에서 올리면 → 가운데로 (default)
        newIndex = 1;
      } else {
        // 그 외에는 → 최대 상태로 (expanded)
        newIndex = computedSnapPoints.length - 1;
      }
    }

    setCurrentSnapIndex(newIndex);
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
