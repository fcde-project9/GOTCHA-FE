"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDistrictClusters } from "@/api/queries/useDistrictClusters";
import { useShopsInBounds } from "@/api/queries/useShopsInBounds";
import { CLUSTER_ZOOM_THRESHOLD, CLUSTER_CLICK_ZOOM_LEVEL } from "@/constants";
import { useMapStore } from "@/stores";
import type { MapBounds, ShopMapResponse } from "@/types/api";
import { applyCenterCoords, type DisplayCluster } from "@/utils/cluster";
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
  /** 클러스터 모드 여부 (줌 레벨 >= CLUSTER_ZOOM_THRESHOLD) */
  isClusterMode: boolean;
  /** 구별 클러스터 데이터 */
  districtClusters: DisplayCluster[];
  /** 클러스터 클릭 핸들러 */
  handleClusterClick: (cluster: DisplayCluster) => void;
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

  // null로 초기화 후 hydration 완료 시 스토어 값으로 복원
  const [mapCenter, setMapCenterState] = useState<MapCenter | null>(null);
  const [mapLevel, setMapLevelState] = useState<number | null>(null);
  const [centerUpdateTrigger, setCenterUpdateTrigger] = useState(0);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [activeBounds, setActiveBounds] = useState<MapBounds | null>(null);

  const shouldAutoReloadRef = useRef(false);
  const hasRestoredFromStore = useRef(false);
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);

  // 스토어에서 지도 상태 복원 (hydration 완료 후, 최초 1회)
  useEffect(() => {
    if (!hasHydrated) return;
    if (hasRestoredFromStore.current) return;
    hasRestoredFromStore.current = true;

    // 스토어에 저장된 위치가 있으면 복원
    if (storedMapCenter) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 스토어 hydration 후 초기 상태 복원
      setMapCenterState(storedMapCenter);
      // 이미 저장된 위치가 있으므로 자동 재검색 설정
      shouldAutoReloadRef.current = true;
    }

    if (storedMapLevel) {
      setMapLevelState(storedMapLevel);
    }
  }, [hasHydrated, storedMapCenter, storedMapLevel]);

  // hydration 완료 전까지는 스토어 값을 직접 사용
  const effectiveMapCenter = hasHydrated ? (mapCenter ?? storedMapCenter) : null;
  const effectiveMapLevel = hasHydrated ? (mapLevel ?? storedMapLevel ?? 5) : 5;

  // 클러스터 모드 판정 (카카오맵: level이 높을수록 축소)
  const isClusterMode = effectiveMapLevel >= CLUSTER_ZOOM_THRESHOLD;

  // 클러스터 모드에서 구별 클러스터 데이터 조회
  const { data: districtClustersData } = useDistrictClusters(isClusterMode);
  const districtClusters = useMemo(() => {
    if (!isClusterMode || !districtClustersData) return [];
    return applyCenterCoords(districtClustersData);
  }, [isClusterMode, districtClustersData]);

  // React Query로 가게 목록 조회 (클러스터 모드에서는 비활성화)
  const { data: shopsData, isLoading: isShopsLoading } = useShopsInBounds(
    activeBounds,
    !isClusterMode
  );

  // 구 필터 적용된 가게 목록
  const filteredShopsData = useMemo(() => {
    if (!shopsData) return [];
    if (!districtFilter) return shopsData;
    return shopsData.filter((s) => s.region2DepthName === districtFilter);
  }, [shopsData, districtFilter]);

  // API 응답을 UI용 데이터로 변환
  const shops = useMemo(() => {
    return shopMapResponsesToViews(filteredShopsData);
  }, [filteredShopsData]);

  const markers = filteredShopsData;

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

  // 클러스터 클릭 핸들러 — 가게 밀집 지점으로 줌인 + 해당 구만 필터
  const handleClusterClick = useCallback(
    (cluster: DisplayCluster) => {
      setDistrictFilter(cluster.districtName);
      setMapCenterState({
        latitude: cluster.shopCenterLatitude,
        longitude: cluster.shopCenterLongitude,
      });
      setStoredMapCenter({
        latitude: cluster.shopCenterLatitude,
        longitude: cluster.shopCenterLongitude,
      });
      setMapLevelState(CLUSTER_CLICK_ZOOM_LEVEL);
      setStoredMapLevel(CLUSTER_CLICK_ZOOM_LEVEL);
      setCenterUpdateTrigger((prev) => prev + 1);
      shouldAutoReloadRef.current = true;
    },
    [setStoredMapCenter, setStoredMapLevel]
  );

  // 지도 영역 변경 시 처리
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setCurrentBounds(bounds);

      // 지도 중심 좌표와 줌 레벨을 스토어에 저장 (뒤로가기 시 복원용)
      setStoredMapCenter({ latitude: bounds.latitude, longitude: bounds.longitude });
      setStoredMapLevel(bounds.level);

      // 줌 레벨 상태 동기화 (클러스터 모드 판정을 위해)
      setMapLevelState(bounds.level);

      // 클러스터 모드에서는 재검색 버튼 숨김
      if (bounds.level >= CLUSTER_ZOOM_THRESHOLD) {
        setShowReloadButton(false);
        return;
      }

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
    [hasInitialLoad, setStoredMapCenter, setStoredMapLevel]
  );

  // 이 지역 재검색 핸들러 (구 필터 해제)
  const handleReloadArea = useCallback(() => {
    if (currentBounds) {
      setDistrictFilter(null);
      setShowReloadButton(false);
      setActiveBounds(currentBounds);
    }
  }, [currentBounds]);

  return {
    mapCenter: effectiveMapCenter,
    setMapCenter,
    mapLevel: effectiveMapLevel,
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
    isClusterMode,
    districtClusters,
    handleClusterClick,
  };
}
