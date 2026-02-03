"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useShopsInBounds } from "@/api/queries/useShopsInBounds";
import { useMapStore } from "@/stores";
import type { MapBounds, ShopMapResponse } from "@/types/api";
import { shopMapResponsesToViews } from "@/utils/shop";

interface MapCenter {
  latitude: number;
  longitude: number;
}

interface UseHomeMapStateReturn {
  /** 지도 중심 좌표 */
  mapCenter: MapCenter | null;
  /** 지도 중심 설정 */
  setMapCenter: (center: MapCenter | null) => void;
  /** 지도 줌 레벨 */
  mapLevel: number;
  /** 지도 줌 레벨 설정 */
  setMapLevel: (level: number) => void;
  /** 중심 좌표 업데이트 트리거 (지도 이동용) */
  centerUpdateTrigger: number;
  /** 중심 좌표 업데이트 트리거 증가 */
  triggerCenterUpdate: () => void;
  /** 지도 영역 내 가게 목록 (UI용) */
  shops: ReturnType<typeof shopMapResponsesToViews>;
  /** 지도 마커 데이터 */
  markers: ShopMapResponse[];
  /** 가게 목록 로딩 중 */
  isShopsLoading: boolean;
  /** 재검색 버튼 표시 여부 */
  showReloadButton: boolean;
  /** 지도 영역 변경 핸들러 */
  handleBoundsChange: (bounds: MapBounds) => void;
  /** 이 지역 재검색 핸들러 */
  handleReloadArea: () => void;
  /** 자동 재검색 플래그 설정 */
  setShouldAutoReload: (value: boolean) => void;
  /** 스토어 hydration 완료 여부 */
  hasHydrated: boolean;
  /** 스토어에 저장된 지도 중심 */
  storedMapCenter: MapCenter | null;
}

/**
 * 홈 페이지 지도 상태 관리 Hook
 * - 지도 중심, 줌 레벨
 * - 영역 내 가게 목록 조회
 * - 재검색 버튼 상태
 */
export function useHomeMapState(): UseHomeMapStateReturn {
  // Zustand 스토어에서 지도 상태 가져오기
  const {
    mapCenter: storedMapCenter,
    mapLevel: storedMapLevel,
    hasHydrated,
    setMapCenter: setStoredMapCenter,
    setMapLevel: setStoredMapLevel,
  } = useMapStore();

  const [mapCenter, setMapCenterState] = useState<MapCenter | null>(null);
  const [mapLevel, setMapLevelState] = useState(5);
  const [centerUpdateTrigger, setCenterUpdateTrigger] = useState(0);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [activeBounds, setActiveBounds] = useState<MapBounds | null>(null);

  const shouldAutoReloadRef = useRef(false);
  const hasRestoredFromStore = useRef(false);

  // React Query로 가게 목록 조회
  const { data: shopsData, isLoading: isShopsLoading } = useShopsInBounds(activeBounds);

  // API 응답을 UI용 데이터로 변환
  const shops = useMemo(() => {
    if (!shopsData) return [];
    return shopMapResponsesToViews(shopsData);
  }, [shopsData]);

  const markers = shopsData ?? [];

  // 스토어에서 지도 상태 복원 (hydration 완료 후, 최초 1회)
  useEffect(() => {
    if (!hasHydrated) return;
    if (hasRestoredFromStore.current) return;
    hasRestoredFromStore.current = true;

    if (storedMapCenter) {
      setMapCenterState(storedMapCenter);
      setCenterUpdateTrigger((prev) => prev + 1);
      shouldAutoReloadRef.current = true;
    }

    if (storedMapLevel) {
      setMapLevelState(storedMapLevel);
    }
  }, [hasHydrated, storedMapCenter, storedMapLevel]);

  // 지도 중심 변경 시 스토어에 저장
  const setMapCenter = useCallback(
    (center: MapCenter | null) => {
      setMapCenterState(center);
      setStoredMapCenter(center);
    },
    [setStoredMapCenter]
  );

  // 지도 줌 레벨 변경 시 스토어에 저장
  const setMapLevel = useCallback(
    (level: number) => {
      setMapLevelState(level);
      setStoredMapLevel(level);
    },
    [setStoredMapLevel]
  );

  // 중심 좌표 업데이트 트리거 증가
  const triggerCenterUpdate = useCallback(() => {
    setCenterUpdateTrigger((prev) => prev + 1);
  }, []);

  // 자동 재검색 플래그 설정
  const setShouldAutoReload = useCallback((value: boolean) => {
    shouldAutoReloadRef.current = value;
  }, []);

  // 지도 영역 변경 시 처리
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setCurrentBounds(bounds);

      if (!hasInitialLoad) {
        // 최초 로드 시 자동으로 가게 목록 조회
        setActiveBounds(bounds);
        setHasInitialLoad(true);
        shouldAutoReloadRef.current = false;
      } else if (shouldAutoReloadRef.current) {
        // 현재 위치 버튼 클릭 또는 위치 수신 시 자동 재검색
        setActiveBounds(bounds);
        shouldAutoReloadRef.current = false;
        setShowReloadButton(false);
      } else {
        // 이후 지도 이동 시 재검색 버튼 표시
        setShowReloadButton(true);
      }
    },
    [hasInitialLoad]
  );

  // 이 지역 재검색 핸들러
  const handleReloadArea = useCallback(() => {
    if (currentBounds) {
      setShowReloadButton(false);
      setActiveBounds(currentBounds);
    }
  }, [currentBounds]);

  return {
    mapCenter,
    setMapCenter,
    mapLevel,
    setMapLevel,
    centerUpdateTrigger,
    triggerCenterUpdate,
    shops,
    markers,
    isShopsLoading,
    showReloadButton,
    handleBoundsChange,
    handleReloadArea,
    setShouldAutoReload,
    hasHydrated,
    storedMapCenter,
  };
}
