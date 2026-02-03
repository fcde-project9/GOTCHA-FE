"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ShopMapResponse } from "@/types/api";

interface UseHomeBottomSheetReturn {
  /** 선택된 가게 */
  selectedShop: ShopMapResponse | null;
  /** 미리보기 바텀시트 표시 여부 */
  showPreviewSheet: boolean;
  /** 기본 바텀시트 퇴장 애니메이션 */
  isListSheetLeaving: boolean;
  /** 미리보기 바텀시트 퇴장 애니메이션 */
  isPreviewSheetLeaving: boolean;
  /** 기본 바텀시트 입장 애니메이션 필요 여부 */
  shouldAnimateIn: boolean;
  /** 바텀시트 높이 */
  bottomSheetHeight: number;
  /** 바텀시트 드래그 중 여부 */
  isSheetDragging: boolean;
  /** 버튼 표시 여부 (바텀시트 높이 기준) */
  isButtonVisible: boolean;
  /** 버튼 위치 (bottom px) */
  buttonBottom: number;
  /** 마커 클릭 핸들러 */
  handleMarkerClick: (marker: ShopMapResponse) => void;
  /** 지도 클릭 핸들러 */
  handleMapClick: () => void;
  /** 미리보기 닫기 핸들러 */
  handlePreviewClose: () => void;
  /** 바텀시트 높이 변경 핸들러 */
  handleBottomSheetHeightChange: (height: number, isDragging: boolean) => void;
  /** 가게 선택 핸들러 (리스트에서 선택) */
  handleShopSelect: (shopId: number, markers: ShopMapResponse[]) => void;
}

/**
 * 홈 페이지 바텀시트 상태 관리 Hook
 * - 선택된 가게 상태
 * - 바텀시트 전환 애니메이션
 * - 바텀시트 높이 및 버튼 위치
 */
export function useHomeBottomSheet(): UseHomeBottomSheetReturn {
  const [selectedShop, setSelectedShop] = useState<ShopMapResponse | null>(null);
  const selectedShopRef = useRef<ShopMapResponse | null>(null);
  const [hadSelectedShop, setHadSelectedShop] = useState(false);
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const [isListSheetLeaving, setIsListSheetLeaving] = useState(false);
  const [isPreviewSheetLeaving, setIsPreviewSheetLeaving] = useState(false);
  const [returnFromDetail] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(290);
  const [isSheetDragging, setIsSheetDragging] = useState(false);

  // selectedShop 변경 시 ref 동기화
  useEffect(() => {
    selectedShopRef.current = selectedShop;
  }, [selectedShop]);

  // 기본 바텀시트 퇴장 애니메이션 완료 후 미리보기 바텀시트 표시
  useEffect(() => {
    if (isListSheetLeaving) {
      const timer = setTimeout(() => {
        // 전환 중 지도 클릭으로 selectedShop이 null이 된 경우 전환 취소
        if (!selectedShopRef.current) {
          setIsListSheetLeaving(false);
          return;
        }
        setShowPreviewSheet(true);
        setIsListSheetLeaving(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListSheetLeaving]);

  // 미리보기 닫기 → 기본 바텀시트 복귀 (애니메이션 포함)
  const handlePreviewClose = useCallback(() => {
    setIsPreviewSheetLeaving(true);
    // 애니메이션(550ms) 완료 후 실제로 닫기
    setTimeout(() => {
      setSelectedShop(null);
      setShowPreviewSheet(false);
      setIsPreviewSheetLeaving(false);
    }, 550);
  }, []);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (marker: ShopMapResponse) => {
      // 미리보기가 이미 열려있으면 해당 핀의 미리보기로 전환
      if (showPreviewSheet) {
        setSelectedShop(marker);
        return;
      }

      setHadSelectedShop(true);
      setSelectedShop(marker);
      setIsListSheetLeaving(true);
    },
    [showPreviewSheet]
  );

  // 지도 클릭 핸들러
  const handleMapClick = useCallback(() => {
    if (showPreviewSheet) {
      handlePreviewClose();
    } else {
      setSelectedShop(null);
    }
  }, [showPreviewSheet, handlePreviewClose]);

  // 바텀시트 높이 변경 핸들러
  const handleBottomSheetHeightChange = useCallback((height: number, isDragging: boolean) => {
    setBottomSheetHeight(height);
    setIsSheetDragging(isDragging);
  }, []);

  // 가게 선택 핸들러 (리스트에서 선택)
  const handleShopSelect = useCallback(
    (shopId: number, markers: ShopMapResponse[]) => {
      const marker = markers.find((m) => m.id === shopId);
      if (marker) handleMarkerClick(marker);
    },
    [handleMarkerClick]
  );

  // 바텀시트 높이에 따른 버튼 위치 계산
  // BottomSheet의 실제 DOM 높이는 currentHeight - 72px
  // 버튼은 바텀시트 위에 16px 여백을 두고 위치
  const buttonBottom = bottomSheetHeight - 72 + 16;

  // 바텀시트가 500px 이상일 때 버튼 숨기기 (최대 높이에 가까울 때)
  const isButtonVisible = bottomSheetHeight < 500;

  // 기본 바텀시트 입장 애니메이션 필요 여부
  const shouldAnimateIn =
    (hadSelectedShop && !isListSheetLeaving) || returnFromDetail || isPreviewSheetLeaving;

  return {
    selectedShop,
    showPreviewSheet,
    isListSheetLeaving,
    isPreviewSheetLeaving,
    shouldAnimateIn,
    bottomSheetHeight,
    isSheetDragging,
    isButtonVisible,
    buttonBottom,
    handleMarkerClick,
    handleMapClick,
    handlePreviewClose,
    handleBottomSheetHeightChange,
    handleShopSelect,
  };
}
