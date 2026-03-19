"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[]; // 스냅 포인트 (픽셀 단위)
  defaultSnapPoint?: number; // 기본 스냅 포인트 인덱스
  onHeightChange?: (height: number, isDragging: boolean) => void; // 높이 변경 콜백 (isDragging 추가)
  scrollToTop?: number | string; // 스크롤을 맨 위로 이동시키기
  scrollable?: boolean; // 내부 스크롤 여부 (기본값: true)
  animateIn?: boolean; // 마운트 시 슬라이드 업 애니메이션 (기본값: false)
  animateOut?: boolean; // 슬라이드 다운 퇴장 애니메이션 (기본값: false)
  onSnapChange?: (snapIndex: number) => void; // 스냅 포인트 변경 콜백
  onExpandAttempt?: () => void; // 최대 스냅에서 위로 드래그 시 콜백 (확장 애니메이션 후 호출)
}

/** 바텀시트 최대 높이 기준 상단 여백 - 검색창 + 재검색 버튼 영역 확보 (px) */
const TOP_AREA_HEIGHT = 80;
/** 스냅 포인트 값과 실제 렌더링 높이 간 보정값 (px) */
const HEIGHT_RENDER_OFFSET = 68;
/** 확장 스냅 포인트 추가 보정값 (TOP_AREA_HEIGHT에서 HEIGHT_RENDER_OFFSET을 뺀 나머지) */
const EXPANDED_TOP_MARGIN = TOP_AREA_HEIGHT - HEIGHT_RENDER_OFFSET;

export default function BottomSheet({
  children,
  snapPoints,
  defaultSnapPoint = 0,
  onHeightChange,
  scrollToTop,
  scrollable = true,
  animateIn = false,
  animateOut = false,
  onSnapChange,
  onExpandAttempt,
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
  const expandedHeight = containerHeight ? containerHeight - EXPANDED_TOP_MARGIN : 715;
  const computedSnapPoints = useMemo(() => {
    if (snapPoints) {
      // snap point에 Infinity가 있으면 expanded 높이로 대체
      return snapPoints.map((p) => (p === Infinity ? expandedHeight : p));
    }

    return [106, 290, expandedHeight];
  }, [snapPoints, expandedHeight]);

  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const fullHeight = containerHeight ?? expandedHeight + EXPANDED_TOP_MARGIN;
  const dragMax = onExpandAttempt ? fullHeight : computedSnapPoints[computedSnapPoints.length - 1];
  const currentHeight = isExpanding
    ? fullHeight
    : isDragging
      ? Math.max(
          computedSnapPoints[0],
          Math.min(dragMax, computedSnapPoints[currentSnapIndex] - (currentY - startY))
        )
      : computedSnapPoints[currentSnapIndex];

  const dragDecidedRef = useRef<"drag" | "scroll" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    dragDecidedRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const delta = touchY - startY;

    if (dragDecidedRef.current === null) {
      if (Math.abs(delta) < 5) return;
      const contentEl = contentRef.current;
      const isAtTop = !contentEl || contentEl.scrollTop <= 0;
      const isMovingDown = delta > 0;

      if (isMovingDown && isAtTop) {
        dragDecidedRef.current = "drag";
      } else if (!isMovingDown && currentSnapIndex < computedSnapPoints.length - 1) {
        dragDecidedRef.current = "drag";
      } else {
        dragDecidedRef.current = "scroll";
      }
    }

    if (dragDecidedRef.current === "scroll") return;

    e.preventDefault();
    setIsDragging(true);
    setCurrentY(touchY);
  };

  const handleTouchEnd = () => {
    dragDecidedRef.current = null;
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
      } else if (currentSnapIndex > 0) {
        // 최소가 아니면 → 최소 상태로 (collapsed)
        newIndex = 0;
      }
      // 최소 상태(index 0)에서는 더 이상 내려가지 않음
    } else if (deltaY < -threshold) {
      // 위로 드래그
      if (currentSnapIndex === 0) {
        // 맨 아래에서 올리면 → 가운데로 (default)
        newIndex = 1;
      } else if (currentSnapIndex === computedSnapPoints.length - 1) {
        // 이미 최대 상태에서 위로 드래그 → 확장 애니메이션 후 콜백
        if (onExpandAttempt) {
          setIsExpanding(true);
          requestAnimationFrame(() => {
            setTimeout(() => onExpandAttempt(), 400);
          });
        }
      } else {
        // 그 외에는 → 최대 상태로 (expanded)
        newIndex = computedSnapPoints.length - 1;
      }
    }

    setCurrentSnapIndex(newIndex);
    onSnapChange?.(newIndex);
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
      } else if (currentSnapIndex > 0) {
        // 최소가 아니면 → 최소 상태로 (collapsed)
        newIndex = 0;
      }
      // 최소 상태(index 0)에서는 더 이상 내려가지 않음
    } else if (deltaY < -threshold) {
      // 위로 드래그
      if (currentSnapIndex === 0) {
        // 맨 아래에서 올리면 → 가운데로 (default)
        newIndex = 1;
      } else if (currentSnapIndex === computedSnapPoints.length - 1) {
        // 이미 최대 상태에서 위로 드래그 → 확장 애니메이션 후 콜백
        if (onExpandAttempt) {
          setIsExpanding(true);
          requestAnimationFrame(() => {
            setTimeout(() => onExpandAttempt(), 400);
          });
        }
      } else {
        // 그 외에는 → 최대 상태로 (expanded)
        newIndex = computedSnapPoints.length - 1;
      }
    }

    setCurrentSnapIndex(newIndex);
    onSnapChange?.(newIndex);
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
      className={`absolute bottom-0 left-0 right-0 bg-white overflow-hidden z-10 shadow-[0_-3px_10px_0_rgba(163,163,163,0.15)] ${isExpanding ? "" : "rounded-t-[24px]"} ${animateOut ? "animate-slide-down" : animateIn ? "animate-slide-up" : ""}`}
      style={{
        height: isExpanding ? "100%" : `${currentHeight - HEIGHT_RENDER_OFFSET}px`,
        maxHeight: isExpanding
          ? undefined
          : `calc(100% - env(safe-area-inset-top, 0px) - ${TOP_AREA_HEIGHT}px)`,
        transition: isDragging ? "none" : "height 0.3s ease-out",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Grabber */}
      <div className="flex justify-center pt-3 h-[36px] cursor-grab active:cursor-grabbing">
        <div className="w-[44px] h-[4px] bg-[#cfcfcf] rounded-[2px]" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`h-[calc(100%-36px)] ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        {children}
      </div>
    </div>
  );
}
