"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Search, LocateFixed, RefreshCcw, ChevronLeft, CircleX } from "lucide-react";
import { Footer, LocationPermissionModal, SplashScreen } from "@/components/common";
import { SearchResultItem } from "@/components/features/search";
import { ShopListBottomSheet, ShopPreviewBottomSheet } from "@/components/features/shop";
import { DEFAULT_IMAGES } from "@/constants";
import {
  useHomeMapState,
  useHomeSearch,
  useHomeBottomSheet,
  useLocationTracking,
} from "@/hooks/home";

// KakaoMap 동적 로드 - SSR 제외, 초기 번들에서 분리
const KakaoMap = dynamic(() => import("@/components/features/map/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-grey-100">
      <span className="text-grey-500">지도 로딩 중...</span>
    </div>
  ),
});

export default function Home() {
  // 스플래시 상태 - sessionStorage로 세션 당 한 번만 표시
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  // Custom Hooks
  const mapState = useHomeMapState();
  const search = useHomeSearch();
  const bottomSheet = useHomeBottomSheet();

  // 위치 업데이트 시 지도 이동 콜백
  const handleLocationUpdate = useCallback(
    (location: { latitude: number; longitude: number }) => {
      mapState.setMapCenter(location);
      mapState.triggerCenterUpdate();
      mapState.setShouldAutoReload(true);
    },
    [mapState]
  );

  const locationTracking = useLocationTracking(handleLocationUpdate);

  // 스플래시 표시 여부 결정 (클라이언트에서만 실행)
  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown") === "true";
    setShowSplash(!splashShown);
  }, []);

  // 홈페이지에서 pull-to-refresh 비활성화
  useEffect(() => {
    document.body.style.overscrollBehaviorY = "contain";
    return () => {
      document.body.style.overscrollBehaviorY = "";
    };
  }, []);

  // 사용자 위치를 처음 받았을 때 지도 이동 + 자동 재검색
  useEffect(() => {
    if (!mapState.hasHydrated) return;
    if (locationTracking.userLocation && !locationTracking.hasReceivedLocation) {
      locationTracking.setHasReceivedLocation(true);

      // 스토어에 저장된 위치가 없을 때만 현재 위치로 이동
      if (!mapState.storedMapCenter) {
        mapState.setShouldAutoReload(true);
        mapState.setMapCenter(locationTracking.userLocation);
        mapState.triggerCenterUpdate();
      }
    }
  }, [mapState, locationTracking]);

  // 검색 결과 선택 핸들러
  const handleResultClick = (result: Parameters<typeof search.handleResultClick>[0]) => {
    const { latitude, longitude } = search.handleResultClick(result);

    // 자동 재검색 플래그 설정 (지도 이동 후 매장 핀 자동 표시)
    mapState.setShouldAutoReload(true);

    // 선택한 위치로 지도 이동 + 줌 레벨 설정
    mapState.setMapCenter({ latitude, longitude });
    mapState.setMapLevel(3);
    mapState.triggerCenterUpdate();
  };

  // 이 지역 재검색 핸들러 (미리보기 닫기 포함)
  const handleReloadArea = useCallback(() => {
    mapState.handleReloadArea();
    // 미리보기 바텀시트가 열려있으면 닫고 기본 바텀시트로 복귀
    if (bottomSheet.showPreviewSheet) {
      bottomSheet.handlePreviewClose();
    }
  }, [mapState, bottomSheet]);

  // 스플래시 완료 핸들러
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  }, []);

  // 스플래시 표시 중일 때
  if (showSplash === null || showSplash === true) {
    return <SplashScreen duration={2500} onComplete={handleSplashComplete} />;
  }

  return (
    <>
      {/* 위치 권한 모달 */}
      <LocationPermissionModal
        isOpen={locationTracking.showLocationModal}
        onClose={locationTracking.closeLocationModal}
        initialDenied={locationTracking.locationDenied}
        onPermissionGranted={locationTracking.handlePermissionGranted}
      />

      <main className="h-[calc(100dvh-70px)] overflow-hidden relative touch-none">
        <div className="flex h-full flex-col items-center relative touch-auto">
          {/* 카카오맵 */}
          <div className="w-full h-full relative">
            <KakaoMap
              width="100%"
              height="100%"
              latitude={mapState.mapCenter?.latitude}
              longitude={mapState.mapCenter?.longitude}
              level={mapState.mapLevel}
              centerUpdateTrigger={mapState.centerUpdateTrigger}
              markers={mapState.markers}
              onBoundsChange={mapState.handleBoundsChange}
              onMarkerClick={bottomSheet.handleMarkerClick}
              onMapClick={bottomSheet.handleMapClick}
              selectedMarkerId={bottomSheet.selectedShop?.id ?? null}
              currentLocation={locationTracking.currentLocation}
            />

            {/* 검색창 */}
            <SearchBar
              isSearching={search.isSearching}
              searchQuery={search.searchQuery}
              onSearchClick={search.handleSearchClick}
              onSearchCancel={search.handleSearchCancel}
              onSearchChange={search.setSearchQuery}
              onClearSearch={search.handleClearSearch}
            />

            {/* 이 지역 재검색 버튼 */}
            {!search.isSearching && mapState.showReloadButton && (
              <ReloadButton onClick={handleReloadArea} />
            )}

            {/* 현재 위치 버튼 */}
            {!search.isSearching && (
              <CurrentLocationButton
                onClick={locationTracking.handleCurrentLocation}
                bottom={bottomSheet.buttonBottom}
                isVisible={bottomSheet.isButtonVisible}
                isSheetDragging={bottomSheet.isSheetDragging}
              />
            )}
          </div>

          {/* 검색 결과 Overlay */}
          {search.isSearching && (
            <SearchOverlay
              searchQuery={search.searchQuery}
              results={search.results}
              onResultClick={handleResultClick}
            />
          )}

          {/* 바텀시트 */}
          {!search.isSearching &&
            (!bottomSheet.showPreviewSheet || bottomSheet.isListSheetLeaving) && (
              <ShopListBottomSheet
                shops={mapState.shops}
                isLoading={mapState.isShopsLoading}
                onHeightChange={bottomSheet.handleBottomSheetHeightChange}
                animateIn={bottomSheet.shouldAnimateIn}
                animateOut={bottomSheet.isListSheetLeaving}
                onShopSelect={(shopId) => bottomSheet.handleShopSelect(shopId, mapState.markers)}
              />
            )}

          {/* 업체 미리보기 바텀시트 */}
          {!search.isSearching && bottomSheet.showPreviewSheet && bottomSheet.selectedShop && (
            <ShopPreviewBottomSheet
              shopId={bottomSheet.selectedShop.id}
              onClose={bottomSheet.handlePreviewClose}
              isLeaving={bottomSheet.isPreviewSheetLeaving}
            />
          )}
        </div>
      </main>
      {!search.isSearching && <Footer />}
    </>
  );
}

// ============ Presenter Components ============

interface SearchBarProps {
  isSearching: boolean;
  searchQuery: string;
  onSearchClick: () => void;
  onSearchCancel: () => void;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

function SearchBar({
  isSearching,
  searchQuery,
  onSearchClick,
  onSearchCancel,
  onSearchChange,
  onClearSearch,
}: SearchBarProps) {
  return (
    <div className="absolute left-0 right-0 top-8 z-30 mx-auto w-full max-w-[480px] px-5">
      {!isSearching ? (
        <button
          onClick={onSearchClick}
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
            onClick={onSearchCancel}
            className="flex size-6 items-center justify-center"
            aria-label="취소"
          >
            <ChevronLeft size={24} className="stroke-grey-800" strokeWidth={1.5} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="지역 또는 지하철역 검색"
            autoFocus
            className="flex-1 w-[106.7%] bg-transparent text-[16px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900 placeholder:text-grey-600 focus:outline-none origin-left scale-[0.9375]"
          />
          {searchQuery && (
            <button onClick={onClearSearch} aria-label="검색어 지우기">
              <CircleX size={24} className="fill-grey-500 stroke-grey-50" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ReloadButtonProps {
  onClick: () => void;
}

function ReloadButton({ onClick }: ReloadButtonProps) {
  return (
    <div className="absolute left-0 right-0 top-[88px] z-10 mx-auto flex w-full max-w-[480px] justify-center px-5">
      <button
        onClick={onClick}
        className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
      >
        <RefreshCcw size={16} className="stroke-grey-900" strokeWidth={2} />
        <span className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-900">
          이 지역 재검색
        </span>
      </button>
    </div>
  );
}

interface CurrentLocationButtonProps {
  onClick: () => void;
  bottom: number;
  isVisible: boolean;
  isSheetDragging: boolean;
}

function CurrentLocationButton({
  onClick,
  bottom,
  isVisible,
  isSheetDragging,
}: CurrentLocationButtonProps) {
  return (
    <div
      className={`absolute right-0 z-10 mx-auto w-full max-w-[480px] px-5 ${
        !isSheetDragging ? "transition-all duration-150" : ""
      }`}
      style={{
        bottom: `${bottom}px`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="flex justify-end">
        <button
          onClick={onClick}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
          aria-label="현재 위치"
        >
          <LocateFixed size={20} className="stroke-grey-800" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

interface SearchOverlayProps {
  searchQuery: string;
  results: ReturnType<typeof useHomeSearch>["results"];
  onResultClick: (result: ReturnType<typeof useHomeSearch>["results"][number]) => void;
}

function SearchOverlay({ searchQuery, results, onResultClick }: SearchOverlayProps) {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 z-20 bg-default flex flex-col">
      <div className="flex-1 overflow-hidden px-[22px] pt-24">
        {searchQuery.trim() === "" ? (
          <SearchEmptyState />
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-[14px] overflow-y-auto h-full">
            {results.map((result) => (
              <SearchResultItem
                key={result.id}
                result={result}
                searchQuery={searchQuery}
                onClick={() => onResultClick(result)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center pt-8">
            <p className="text-[16px] font-normal leading-[1.5] tracking-[-0.16px] text-grey-500">
              검색 결과가 없어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchEmptyState() {
  return (
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
  );
}
