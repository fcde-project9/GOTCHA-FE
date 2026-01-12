"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, LocateFixed } from "lucide-react";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useUser } from "@/api/queries/useUser";
import type { NearbyShopResponse, ApiResponse, NearbyShopsResponse, User } from "@/api/types";
import { Button } from "@/components/common";
import { KakaoMap } from "@/components/features/map";
import { ShopDuplicateCheckModal } from "@/components/report/ShopDuplicateCheckModal";

// 카카오맵 타입
interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

// 위치 핀 이미지
const LOCATION_PIN_IMAGE = "/images/markers/shop-marker.png";
const MY_LOCATION_IMAGE = "/images/markers/my-location-marker.png";

export default function ReportLocationPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const currentUser: User | undefined = user;
  const [address, setAddress] = useState("위치를 선택해주세요");
  const [center, setCenter] = useState({ latitude: 37.4979, longitude: 127.0276 }); // 강남역 기본값
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [map, setMap] = useState<KakaoMap | null>(null);

  const profileImageUrl = currentUser?.profileImageUrl || "/images/default-profile.png";

  const [nearbyShops, setNearbyShops] = useState<NearbyShopsResponse | null>(null);

  // 근처 가게 확인 함수
  const checkNearbyShops = async (latitude: number, longitude: number) => {
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
  };

  useEffect(() => {
    // 사용자의 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ latitude, longitude });
          setMyLocation({ latitude, longitude });
          await getAddressFromCoords(latitude, longitude);
          setIsLoading(false);
        },
        () => {
          // 위치 정보 가져오기 실패 시 기본 위치(강남역) 사용
          setMyLocation({ latitude: 37.4979, longitude: 127.0276 });
          setIsLoading(false);
        }
      );
    } else {
      setMyLocation({ latitude: 37.4979, longitude: 127.0276 });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 내 위치 마커 추가
  useEffect(() => {
    if (!map || !myLocation) return;

    // 프로필 이미지가 포함된 커스텀 오버레이 HTML
    const content = `
      <div class="relative w-[54px] h-[56px]">
        <img src="${MY_LOCATION_IMAGE}" alt="배경" class="absolute top-0 left-[6px] w-[42px] h-[56px]" />
        <img src="${profileImageUrl}" alt="프로필" class="absolute top-[1.5px] left-[7.5px] w-[39px] h-[39px] rounded-full object-cover" />
      </div>
    `;

    const customOverlay = new window.kakao.maps.CustomOverlay({
      map: map,
      position: new window.kakao.maps.LatLng(myLocation.latitude, myLocation.longitude),
      content: content,
      yAnchor: 1,
    });

    return () => {
      customOverlay.setMap(null);
    };
  }, [map, myLocation, profileImageUrl]);

  const getAddressFromCoords = useCallback((lat: number, lng: number) => {
    // 카카오 지도 SDK의 Geocoder 서비스 사용 (CORS 문제 없음)
    if (!window.kakao?.maps?.services) {
      console.error("카카오 지도 서비스가 로드되지 않았습니다");
      setAddress("주소를 가져올 수 없습니다");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].address?.address_name || result[0].road_address?.address_name;
        setAddress(addr || "주소를 가져올 수 없습니다");
      } else {
        console.error("주소 변환 실패:", status);
        setAddress("주소를 가져올 수 없습니다");
      }
    });
  }, []);

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
        router.push(
          `/report/register?lat=${center.latitude}&lng=${center.longitude}&address=${encodeURIComponent(address)}`
        );
      }
    } catch {
      // 에러 발생 시에도 등록 페이지로 이동
      router.push(
        `/report/register?lat=${center.latitude}&lng=${center.longitude}&address=${encodeURIComponent(address)}`
      );
    } finally {
      setCheckingNearby(false);
    }
  };

  const handleSelectNotHere = () => {
    setIsDuplicateModalOpen(false);
    router.push(
      `/report/register?lat=${center.latitude}&lng=${center.longitude}&address=${encodeURIComponent(address)}`
    );
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ latitude, longitude });
        setMyLocation({ latitude, longitude });
        await getAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.error("위치 정보를 가져올 수 없습니다:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-grey-600">위치 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-default min-h-[100dvh] w-full max-w-[480px] mx-auto relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 bg-white h-12 flex items-center px-5 py-2 z-10">
        <button
          onClick={() => router.push("/home")}
          className="w-6 h-6 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="stroke-grey-900" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[18px] font-semibold leading-[1.5] tracking-[-0.18px] text-grey-900 text-center">
          제보
        </h1>
        <div className="w-6" />
      </header>

      {/* Map */}
      <div className="relative h-[100dvh] pt-12">
        <KakaoMap
          width="100%"
          height="100%"
          latitude={center.latitude}
          longitude={center.longitude}
          level={3}
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
            // 지도 클릭 시 해당 위치로 핀 이동 및 주소 업데이트
            window.kakao.maps.event.addListener(
              mapInstance,
              "click",
              async (...args: unknown[]) => {
                const mouseEvent = args[0] as { latLng: KakaoLatLng };
                const latlng = mouseEvent.latLng;
                const latitude = latlng.getLat();
                const longitude = latlng.getLng();
                setCenter({ latitude, longitude });
                await getAddressFromCoords(latitude, longitude);

                // 자동으로 근처 가게 확인 (새 좌표로)
                const result = await checkNearbyShops(latitude, longitude);
                setNearbyShops(result);
              }
            );
          }}
        />

        {/* Center Pin - positioned at center of visible map area (between header and bottom card) */}
        <div
          className="absolute left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center px-[7px] pointer-events-none"
          style={{ top: "calc(50% + 40px)", transform: "translate(-50%, -100%)" }}
        >
          <img src={LOCATION_PIN_IMAGE} alt="위치 핀" width={42} height={56} />
        </div>

        {/* 현재 위치 버튼 */}
        <div className="absolute bottom-[200px] right-0 z-10 mx-auto w-full max-w-[480px] px-5">
          <div className="flex justify-end">
            <button
              onClick={handleCurrentLocation}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-2 shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]"
              aria-label="현재 위치"
            >
              <LocateFixed size={16} className="stroke-grey-800" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-[0px_-4px_12px_rgba(0,0,0,0.1)] z-30">
        <div className="flex flex-col gap-4">
          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-grey-600">
              제보할 위치
            </label>
            <div className="bg-grey-100 min-h-11 flex items-center px-3 py-2 rounded-lg">
              <p className="text-[15px] font-semibold leading-[1.5] tracking-[-0.15px] text-grey-700">
                {address}
              </p>
            </div>
          </div>

          {/* Nearby Shop Count */}
          {nearbyShops && nearbyShops.count > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-semibold leading-[1.5] tracking-[-0.14px] text-grey-900">
                50m 이내에 이미 등록된 {nearbyShops.count}개의 가챠샵이 있어요
              </p>
              <p className="text-[12px] font-normal leading-[1.5] tracking-[-0.12px] text-grey-500">
                등록 전, 중복되는 가챠샵이 있는지 확인해주세요
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="secondary"
            size="medium"
            fullWidth
            loading={checkingNearby}
            onClick={handleSubmit}
          >
            이 주소로 등록하기
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
