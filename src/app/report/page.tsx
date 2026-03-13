"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { NearbyShopResponse, ApiResponse, NearbyShopsResponse } from "@/api/types";
import { Button, BackHeader } from "@/components/common";
import { KakaoMap } from "@/components/features/map";
import { ShopDuplicateCheckModal } from "@/components/report/ShopDuplicateCheckModal";
import { MARKER_IMAGES, DEFAULT_LOCATION } from "@/constants";
import { useKakaoLoader } from "@/hooks/useKakaoLoader";
import { trackShopReportStart, trackShopReportExit } from "@/utils/analytics";
import { getCurrentLocation } from "@/utils/geolocation";

export default function ReportLocationPage() {
  const router = useRouter();
  const [address, setAddress] = useState("위치를 선택해주세요");
  const [center, setCenter] = useState({ ...DEFAULT_LOCATION });
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [nearbyShops, setNearbyShops] = useState<NearbyShopsResponse | null>(null);
  const mapLevelRef = useRef(3);
  const [pendingLocation, setPendingLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 카카오맵 SDK 로드 상태
  const { loaded: kakaoLoaded, error: kakaoError } = useKakaoLoader();

  // 근처 가게 확인 함수
  const checkNearbyShops = useCallback(async (latitude: number, longitude: number) => {
    try {
      const { data } = await apiClient.get<ApiResponse<NearbyShopsResponse>>(
        ENDPOINTS.SHOPS.NEARBY,
        {
          params: { latitude, longitude },
        }
      );
      return data.data ?? null;
    } catch (error) {
      console.error("근처 가게 확인 실패:", error);
      return null;
    }
  }, []);

  // GA 이벤트: 제보하기 진입
  useEffect(() => {
    trackShopReportStart();
  }, []);

  // 사용자의 현재 위치 가져오기 (Capacitor 네이티브 플러그인 사용)
  useEffect(() => {
    (async () => {
      const location = await getCurrentLocation();
      if (location) {
        setCenter(location);
        setMyLocation(location);
        setPendingLocation(location);
      } else {
        setMyLocation({ ...DEFAULT_LOCATION });
        setPendingLocation({ ...DEFAULT_LOCATION });
      }
    })();
  }, []);

  // SDK 로드 완료 후 주소 변환
  useEffect(() => {
    if (kakaoError && pendingLocation) {
      // SDK 로드 실패 시 에러 처리
      setAddress("주소를 가져올 수 없어요");
      setIsLoading(false);
      setPendingLocation(null);
      return;
    }

    if (kakaoLoaded && pendingLocation) {
      getAddressFromCoords(pendingLocation.latitude, pendingLocation.longitude).then(() => {
        setIsLoading(false);
      });
      setPendingLocation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakaoLoaded, kakaoError, pendingLocation]);

  const getAddressFromCoords = useCallback((lat: number, lng: number): Promise<void> => {
    return new Promise((resolve) => {
      // 카카오 지도 SDK의 Geocoder 서비스 사용 (CORS 문제 없음)
      if (!window.kakao?.maps?.services) {
        console.error("카카오 지도 서비스가 로드되지 않았습니다");
        setAddress("주소를 가져올 수 없어요");
        resolve();
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const addr = result[0].address?.address_name || result[0].road_address?.address_name;
          setAddress(addr || "주소를 가져올 수 없어요");
        } else {
          console.error("주소 변환 실패:", status);
          setAddress("주소를 가져올 수 없어요");
        }
        resolve();
      });
    });
  }, []);

  // 지도 드래그 종료 이벤트 핸들러
  const handleDragEnd = useCallback(async () => {
    if (!map) return;

    const mapCenter = map.getCenter();
    const latitude = mapCenter.getLat();
    const longitude = mapCenter.getLng();
    setCenter({ latitude, longitude });
    setIsAtCurrentLocation(false);
    await getAddressFromCoords(latitude, longitude);

    // 자동으로 근처 가게 확인 (새 좌표로)
    const result = await checkNearbyShops(latitude, longitude);
    setNearbyShops(result);
  }, [map, getAddressFromCoords, checkNearbyShops]);

  // 줌 레벨 변경 시 ref에 저장 (리렌더 없이 추적)
  const handleZoomChanged = useCallback(() => {
    if (map) {
      mapLevelRef.current = map.getLevel();
    }
  }, [map]);

  // 지도 드래그, 줌 이벤트 리스너 등록/해제
  useEffect(() => {
    if (!map || !window.kakao?.maps?.event) return;

    window.kakao.maps.event.addListener(map, "dragend", handleDragEnd);
    window.kakao.maps.event.addListener(map, "zoom_changed", handleZoomChanged);

    return () => {
      window.kakao.maps.event.removeListener(map, "dragend", handleDragEnd);
      window.kakao.maps.event.removeListener(map, "zoom_changed", handleZoomChanged);
    };
  }, [map, handleDragEnd, handleZoomChanged]);

  const navigateToRegister = () => {
    router.push(
      `/report/register?lat=${center.latitude}&lng=${center.longitude}&address=${encodeURIComponent(address)}`
    );
  };

  const handleSubmit = async () => {
    setCheckingNearby(true);
    try {
      // 근처 가게 확인
      const result = await checkNearbyShops(center.latitude, center.longitude);

      if (result && result.count > 0) {
        // 근처 가게가 있으면 중복 체크 모달 표시
        setNearbyShops(result);
        setIsDuplicateModalOpen(true);
      } else {
        // 근처 가게가 없으면 업체 정보 등록 페이지로 이동
        navigateToRegister();
      }
    } catch {
      // 에러 발생 시에도 등록 페이지로 이동
      navigateToRegister();
    } finally {
      setCheckingNearby(false);
    }
  };

  const handleSelectNotHere = () => {
    setIsDuplicateModalOpen(false);
    navigateToRegister();
  };

  const [isLocating, setIsLocating] = useState(false);
  const [isAtCurrentLocation, setIsAtCurrentLocation] = useState(false);

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    const location = await getCurrentLocation({ enableHighAccuracy: true, timeout: 5000 });

    if (location) {
      setCenter(location);
      setMyLocation(location);
      setIsAtCurrentLocation(true);

      // 지도 중심을 현재 위치로 이동
      if (map && window.kakao?.maps) {
        const moveLatLng = new window.kakao.maps.LatLng(location.latitude, location.longitude);
        map.setCenter(moveLatLng);
      }

      await getAddressFromCoords(location.latitude, location.longitude);

      // 근처 가게 확인
      const result = await checkNearbyShops(location.latitude, location.longitude);
      setNearbyShops(result);
    }
    setIsLocating(false);
  };

  if (isLoading) {
    return (
      <div className="bg-default h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-[480px] mx-auto flex items-center justify-center overflow-hidden">
        <p className="text-grey-600">위치 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-default h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-[480px] mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <BackHeader
        title="제보하기"
        onBack={() => {
          trackShopReportExit("location");
          router.push("/home");
        }}
      />

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <KakaoMap
          width="100%"
          height="100%"
          latitude={center.latitude}
          longitude={center.longitude}
          level={mapLevelRef.current}
          currentLocation={
            myLocation
              ? {
                  latitude: myLocation.latitude,
                  longitude: myLocation.longitude,
                  heading: null,
                }
              : null
          }
          onMapLoad={(mapInstance) => {
            setMap(mapInstance);
          }}
        />

        {/* Center Pin */}
        <div
          className="absolute left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center px-[7px] pointer-events-none"
          style={{ top: "calc(50% + 5px)", transform: "translate(-50%, -100%)" }}
        >
          <img src={MARKER_IMAGES.REPORT} alt="위치 핀" width={42} height={56} />
        </div>

        {/* 현재 위치 버튼 */}
        <div className="absolute bottom-[59px] right-5 z-20">
          <button
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)] disabled:opacity-70"
            aria-label="현재 위치"
          >
            {isLocating ? (
              <Loader2 size={20} className="stroke-grey-800 animate-spin" strokeWidth={1.5} />
            ) : (
              <LocateFixed
                size={20}
                className={isAtCurrentLocation ? "stroke-main" : "stroke-grey-800"}
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="shrink-0 bg-white rounded-t-3xl px-5 pt-5 pb-[68px] shadow-[0_-3px_10px_0_rgba(163,163,163,0.15)] relative z-10 -mt-11">
        <div className="flex flex-col gap-[22px]">
          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-normal leading-[1.5] tracking-[-0.15px] text-grey-600 text-center">
              제보할 위치
            </label>
            <div className="bg-grey-100 min-h-11 flex items-center justify-center px-5 py-2 rounded-lg">
              <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-grey-700 text-center break-words">
                {address}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="medium"
            fullWidth
            loading={checkingNearby}
            onClick={handleSubmit}
          >
            이 주소로 등록할래요!
          </Button>
        </div>
      </div>

      {/* Shop Duplicate Check Modal */}
      <ShopDuplicateCheckModal
        isOpen={isDuplicateModalOpen}
        shops={
          nearbyShops?.shops?.map((shop: NearbyShopResponse, index: number) => ({
            id: index,
            name: shop.name,
            mainImageUrl: shop.mainImageUrl,
          })) ?? []
        }
        onClose={() => setIsDuplicateModalOpen(false)}
        onSelectNotHere={handleSelectNotHere}
      />
    </div>
  );
}
