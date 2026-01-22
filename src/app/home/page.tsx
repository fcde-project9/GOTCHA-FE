"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, LocateFixed, RefreshCcw, ChevronLeft, CircleX } from "lucide-react";
import { useShopsInBounds } from "@/api/queries/useShopsInBounds";
import { Footer, LocationPermissionModal } from "@/components/common";
import { KakaoMap } from "@/components/features/map";
import { SearchResultItem } from "@/components/features/search";
import { ShopListBottomSheet } from "@/components/features/shop";
import { DEFAULT_IMAGES } from "@/constants";
import { useCurrentLocation, useKakaoPlaces, PlaceSearchResult } from "@/hooks";
import { useMapStore } from "@/stores";
import { MapBounds, ShopMapResponse } from "@/types/api";
import { shopMapResponsesToViews } from "@/utils/shop";

export default function Home() {
  const router = useRouter();
  const { location, getCurrentLocation } = useCurrentLocation();
  const { results, searchPlaces, clearResults } = useKakaoPlaces();

  // Zustand 스토어에서 지도 상태 가져오기
  const {
    mapCenter: storedMapCenter,
    mapLevel: storedMapLevel,
    searchQuery: storedSearchQuery,
    hasHydrated,
    setMapCenter: setStoredMapCenter,
    setMapLevel: setStoredMapLevel,
    setSearchQuery: setStoredSearchQuery,
  } = useMapStore();

  const [bottomSheetHeight, setBottomSheetHeight] = useState(290); // 기본 높이 (헤더 + 약 2개 아이템)
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  const [mapCenter, setMapCenterState] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [activeBounds, setActiveBounds] = useState<MapBounds | null>(null); // 실제 조회할 bounds
  const [showLocationModal, setShowLocationModal] = useState(false);
  const shouldAutoReloadRef = useRef(false);
  const [centerUpdateTrigger, setCenterUpdateTrigger] = useState(0);
  const [locationDenied, setLocationDenied] = useState(false);
  const [hasReceivedLocation, setHasReceivedLocation] = useState(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    heading: number | null;
  } | null>(null);
  const [mapLevel, setMapLevelState] = useState(5); // 지도 줌 레벨 (기본값 5)
  const hasRestoredFromStore = useRef(false); // 스토어에서 복원 완료 여부

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
    // hydration이 완료되지 않았으면 대기
    if (!hasHydrated) return;
    // 이미 복원했으면 스킵
    if (hasRestoredFromStore.current) return;
    hasRestoredFromStore.current = true;

    // 저장된 지도 중심이 있으면 복원
    if (storedMapCenter) {
      setMapCenterState(storedMapCenter);
      setCenterUpdateTrigger((prev) => prev + 1);
      shouldAutoReloadRef.current = true;
    }

    // 저장된 줌 레벨 복원
    if (storedMapLevel) {
      setMapLevelState(storedMapLevel);
    }

    // 저장된 검색어 복원
    if (storedSearchQuery) {
      setSearchQueryState(storedSearchQuery);
    }
  }, [hasHydrated, storedMapCenter, storedMapLevel, storedSearchQuery]);

  // 지도 중심 변경 시 스토어에 저장
  const setMapCenter = useCallback(
    (center: { latitude: number; longitude: number } | null) => {
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

  // 검색어 변경 시 스토어에 저장
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      setStoredSearchQuery(query);
    },
    [setStoredSearchQuery]
  );

  // 홈페이지에서 pull-to-refresh 비활성화
  useEffect(() => {
    document.body.style.overscrollBehaviorY = "contain";
    return () => {
      document.body.style.overscrollBehaviorY = "";
    };
  }, []);

  // localStorage에서 권한 거부 플래그 읽기
  useEffect(() => {
    try {
      const denied = localStorage.getItem("locationPermissionDenied") === "true";
      setLocationDenied(denied);
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  // 최초 접속 시 현재 위치 권한 요청
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // 사용자 위치를 처음 받았을 때 지도 이동 + 자동 재검색 + 현재 위치 마커 표시
  // 단, 스토어에 저장된 위치가 있으면 현재 위치로 이동하지 않음
  useEffect(() => {
    // hydration이 완료되지 않았으면 대기 (storedMapCenter 확인을 위해)
    if (!hasHydrated) return;
    if (location && !hasReceivedLocation) {
      setHasReceivedLocation(true);

      // 스토어에 저장된 위치가 없을 때만 현재 위치로 이동
      if (!storedMapCenter) {
        // ref를 먼저 설정 (동기적으로 즉시 반영됨)
        shouldAutoReloadRef.current = true;
        setMapCenter(location);
        setCenterUpdateTrigger((prev) => prev + 1);
      }

      // 현재 위치 마커는 항상 표시
      setShowCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        heading: null,
      });
    }
  }, [hasHydrated, location, hasReceivedLocation, storedMapCenter, setMapCenter]);

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        searchPlaces(searchQuery);
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      clearResults();
    }
  }, [searchQuery, searchPlaces, clearResults]);

  // 지도 영역 변경 시 처리 (ref를 사용해서 항상 최신 값 참조)
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      // 현재 bounds 저장
      setCurrentBounds(bounds);

      if (!hasInitialLoad) {
        // 최초 로드 시 자동으로 가게 목록 조회
        setActiveBounds(bounds);
        setHasInitialLoad(true);
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

  const handleSearchClick = () => {
    setIsSearching(true);
  };

  const handleSearchCancel = () => {
    setIsSearching(false);
    setSearchQuery("");
    clearResults();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    clearResults();
  };

  const handleResultClick = (result: PlaceSearchResult) => {
    // 자동 재검색 플래그 설정 (지도 이동 후 매장 핀 자동 표시)
    shouldAutoReloadRef.current = true;

    // 선택한 위치로 지도 이동 + 줌 레벨 설정 (200-300m 범위가 보이도록)
    setMapCenter({
      latitude: parseFloat(result.y),
      longitude: parseFloat(result.x),
    });
    setMapLevel(3); // 검색 결과 선택 시 확대
    setCenterUpdateTrigger((prev) => prev + 1);

    // 검색어를 선택한 장소명으로 업데이트
    setSearchQuery(result.place_name);

    // 검색 모드 종료
    setIsSearching(false);
    clearResults();
  };

  const handleReloadArea = () => {
    if (currentBounds) {
      setShowReloadButton(false);
      setActiveBounds(currentBounds);
    }
  };

  const handleCurrentLocation = () => {
    // 현재 위치를 다시 가져오고, 가져온 후 지도 중심 업데이트
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        // 지도 중심을 현재 위치로 즉시 업데이트
        setMapCenter(newLocation);
        // 중심 좌표 업데이트 트리거
        setCenterUpdateTrigger((prev) => prev + 1);
        // 자동 재검색 플래그 설정
        shouldAutoReloadRef.current = true;

        // 현재 위치 마커 표시 (heading이 있으면 사용)
        const heading = position.coords.heading;
        setShowCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: heading != null && !isNaN(heading) ? heading : null,
        });

        // 디바이스 방향 감지 시작 (iOS에서는 권한 요청 필요)
        startDeviceOrientationTracking(newLocation);
      },
      (err) => {
        console.error("위치 정보를 가져올 수 없어요:", err);

        // 위치 권한 거부 시만 설정 안내 모달 표시
        if (err.code === err.PERMISSION_DENIED) {
          setLocationDenied(true);
          // localStorage에 거부 플래그 저장
          try {
            localStorage.setItem("locationPermissionDenied", "true");
          } catch {
            // localStorage 접근 불가 시 무시
          }
          setShowLocationModal(true);
        }
        // 다른 에러(타임아웃, 위치 불가 등)는 모달을 표시하지 않음
        // locationDenied 상태와 localStorage 플래그 유지
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // 디바이스 방향 감지
  const startDeviceOrientationTracking = (currentLoc: { latitude: number; longitude: number }) => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // iOS Safari에서는 webkitCompassHeading 사용
      // Android Chrome에서는 alpha 사용 (절대값이 아닐 수 있음)
      let heading: number | null = null;

      if ("webkitCompassHeading" in event && typeof event.webkitCompassHeading === "number") {
        // iOS: webkitCompassHeading은 0-360도, 북쪽 기준
        heading = event.webkitCompassHeading;
      } else if (event.absolute && event.alpha != null) {
        // Android: alpha는 0-360도, 시계 반대 방향
        // 지도에서 사용하기 위해 360에서 빼서 시계 방향으로 변환
        heading = (360 - event.alpha) % 360;
      }

      if (heading != null) {
        setShowCurrentLocation((prev) =>
          prev
            ? { ...prev, heading }
            : { latitude: currentLoc.latitude, longitude: currentLoc.longitude, heading }
        );
      }
    };

    // iOS 13+에서는 권한 요청 필요
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === "function"
    ) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      // Android 및 기타 브라우저
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  };

  const handleBottomSheetHeightChange = (height: number, isDragging: boolean) => {
    setBottomSheetHeight(height);
    setIsSheetDragging(isDragging);
  };

  const handleMarkerClick = (marker: ShopMapResponse) => {
    router.push(`/shop/${marker.id}`);
  };

  // 바텀시트 높이에 따른 버튼 위치 계산
  // BottomSheet의 실제 DOM 높이는 currentHeight - 72px
  // 버튼은 바텀시트 위에 16px 여백을 두고 위치
  const buttonBottom = bottomSheetHeight - 72 + 16;

  // 바텀시트가 500px 이상일 때 버튼 숨기기 (최대 높이에 가까울 때)
  const isButtonVisible = bottomSheetHeight < 500;

  return (
    <>
      {/* 위치 권한 모달 */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          // 모달 닫을 때는 localStorage 플래그 유지 (영구 저장)
          // denied 상태는 다음 렌더링 시 localStorage에서 다시 읽어옴
        }}
        initialDenied={locationDenied}
        onPermissionGranted={(position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setMapCenter(newLocation);
          setShowCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading ?? null,
          });
          startDeviceOrientationTracking(newLocation);
          // 권한 허용 시 denied 상태 초기화 및 localStorage 플래그 제거
          setLocationDenied(false);
          try {
            localStorage.removeItem("locationPermissionDenied");
          } catch {
            // localStorage 접근 불가 시 무시
          }
        }}
      />

      <main className="h-[calc(100dvh-70px)] overflow-hidden relative touch-none">
        <div className="flex h-full flex-col items-center relative touch-auto">
          {/* 카카오맵 */}
          <div className="w-full h-full relative">
            <KakaoMap
              width="100%"
              height="100%"
              latitude={mapCenter?.latitude}
              longitude={mapCenter?.longitude}
              level={mapLevel}
              centerUpdateTrigger={centerUpdateTrigger}
              markers={markers}
              onBoundsChange={handleBoundsChange}
              onMarkerClick={handleMarkerClick}
              currentLocation={showCurrentLocation}
            />

            {/* 검색창 */}
            <div className="absolute left-0 right-0 top-8 z-30 mx-auto w-full max-w-[480px] px-5">
              {!isSearching ? (
                <button
                  onClick={handleSearchClick}
                  className="flex h-11 w-full items-center gap-2 rounded-lg bg-white px-2.5 py-2.5 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
                >
                  <Search size={20} className="stroke-grey-800" strokeWidth={2} />
                  <span
                    className={`text-[15px] font-normal leading-[1.5] tracking-[-0.15px] ${
                      searchQuery ? "text-grey-800" : "text-grey-600"
                    }`}
                  >
                    {searchQuery || "지역 또는 지하철역 검색"}
                  </span>
                </button>
              ) : (
                <div className="flex h-11 items-center gap-2 rounded-lg bg-grey-100 px-1.5 py-2.5">
                  <button
                    onClick={handleSearchCancel}
                    className="flex size-6 items-center justify-center"
                    aria-label="취소"
                  >
                    <ChevronLeft size={24} className="stroke-grey-800" strokeWidth={1.5} />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="지역 또는 지하철역 검색"
                    autoFocus
                    className="flex-1 bg-transparent text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900 placeholder:text-grey-600 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={handleClearSearch} aria-label="검색어 지우기">
                      <CircleX size={24} className="fill-grey-500 stroke-grey-50" strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 이 지역 재검색 버튼 */}
            {!isSearching && showReloadButton && (
              <div className="absolute left-0 right-0 top-[88px] z-10 mx-auto flex w-full max-w-[480px] justify-center px-5">
                <button
                  onClick={handleReloadArea}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
                >
                  <RefreshCcw size={16} className="stroke-grey-900" strokeWidth={2} />
                  <span className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900">
                    이 지역 재검색
                  </span>
                </button>
              </div>
            )}

            {/* 현재 위치 버튼 */}
            {!isSearching && (
              <div
                className={`absolute right-0 z-10 mx-auto w-full max-w-[480px] px-5 ${
                  !isSheetDragging ? "transition-all duration-150" : ""
                }`}
                style={{
                  bottom: `${buttonBottom}px`,
                  opacity: isButtonVisible ? 1 : 0,
                  pointerEvents: isButtonVisible ? "auto" : "none",
                }}
              >
                <div className="flex justify-end">
                  <button
                    onClick={handleCurrentLocation}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
                    aria-label="현재 위치"
                  >
                    <LocateFixed size={20} className="stroke-grey-800" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 검색 결과 Overlay */}
          {isSearching && (
            <div className="absolute left-0 right-0 top-0 bottom-0 z-20 bg-default flex flex-col">
              {/* 검색 결과 영역 - 검색바 아래부터 시작 */}
              <div className="flex-1 overflow-hidden px-[22px] pt-24">
                {searchQuery.trim() === "" ? (
                  /* 초기 안내 화면 */
                  <div className="flex flex-col items-center justify-center pt-[calc(50vh-300px)]">
                    <div className="mb-6 flex items-center justify-center">
                      <Image src={DEFAULT_IMAGES.SEARCH} alt="검색" width={72} height={72} />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                      <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-900">
                        지역을 입력해 매장을 찾아보세요
                      </p>
                      <p className="text-[14px] font-normal leading-[1.5] tracking-[-0.14px] text-grey-500">
                        예시: 강남역, 홍대입구역
                      </p>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  /* 검색 결과 리스트 */
                  <div className="flex flex-col gap-[14px] overflow-y-auto h-full">
                    {results.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        searchQuery={searchQuery}
                        onClick={() => handleResultClick(result)}
                      />
                    ))}
                  </div>
                ) : (
                  /* 검색 결과 없음 */
                  <div className="flex items-center justify-center pt-8">
                    <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-500">
                      검색 결과가 없어요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 바텀시트 */}
          {!isSearching && (
            <ShopListBottomSheet
              shops={shops}
              isLoading={isShopsLoading}
              onHeightChange={handleBottomSheetHeightChange}
            />
          )}
        </div>
      </main>
      {!isSearching && <Footer />}
    </>
  );
}
