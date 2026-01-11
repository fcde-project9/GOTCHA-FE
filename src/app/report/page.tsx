"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCheckNearbyShops } from "@/api/queries/useCheckNearbyShops";
import { useUser } from "@/api/queries/useUser";
import type { NearbyShopResponse } from "@/api/types";
import { KakaoMap } from "@/components/features/map";
import { ShopDuplicateCheckModal } from "@/components/report/ShopDuplicateCheckModal";

// 위치 핀 이미지
const LOCATION_PIN_IMAGE = "/images/markers/shop-marker.png";
const MY_LOCATION_IMAGE = "/images/markers/my-location-marker.png";

export default function ReportLocationPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const [address, setAddress] = useState("위치를 선택해주세요");
  const [center, setCenter] = useState({ latitude: 37.4979, longitude: 127.0276 }); // 강남역 기본값
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [map, setMap] = useState<KakaoMap | null>(null);

  const profileImageUrl = user?.profileImageUrl || "/images/default-profile.png";

  const { data: nearbyShops, refetch: refetchNearbyShops } = useCheckNearbyShops(
    center.latitude,
    center.longitude,
    false // 초기에는 비활성화
  );

  useEffect(() => {
    // 사용자의 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ latitude, longitude });
          setMyLocation({ latitude, longitude });
          getAddressFromCoords(latitude, longitude);
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

  const getAddressFromCoords = (lat: number, lng: number) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result: GeocoderResult[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        setAddress(result[0].address.address_name);
      }
    });
  };

  const handleMapCenterChanged = (kakaoMap: KakaoMap) => {
    const centerPos = kakaoMap.getCenter();
    const latitude = centerPos.getLat();
    const longitude = centerPos.getLng();
    setCenter({ latitude, longitude });
    getAddressFromCoords(latitude, longitude);
  };

  const handleSubmit = async () => {
    setCheckingNearby(true);
    try {
      // 근처 가게 확인
      const result = await refetchNearbyShops();

      if (result.data && result.data.count > 0) {
        // 근처 가게가 있으면 중복 체크 모달 표시
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

  if (isLoading) {
    return (
      <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto flex items-center justify-center">
        <p className="text-grey-600">위치 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-default min-h-screen w-full max-w-[480px] mx-auto relative">
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
      <div className="relative h-screen pt-12">
        <KakaoMap
          width="100%"
          height="100%"
          latitude={center.latitude}
          longitude={center.longitude}
          level={3}
          onMapLoad={(mapInstance) => {
            setMap(mapInstance);
            // 지도 중심 변경 시 주소 업데이트
            window.kakao.maps.event.addListener(mapInstance, "center_changed", () => {
              handleMapCenterChanged(mapInstance);
            });
          }}
        />

        {/* Center Pin - positioned at center of visible map area (between header and bottom card) */}
        <div
          className="absolute flex justify-center items-center"
          style={{
            top: "calc(50% - 100px)",
            left: "50%",
            transform: "translate(-50%, -100%)",
            zIndex: 20,
            width: "56px",
            height: "56px",
            padding: "0 7px",
          }}
        >
          <img src={LOCATION_PIN_IMAGE} alt="위치 핀" width={42} height={56} />
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={checkingNearby}
            className={`w-full h-[46px] rounded-lg flex items-center justify-center text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] transition-colors ${
              checkingNearby
                ? "bg-grey-200 text-grey-400 cursor-not-allowed"
                : "bg-main text-white hover:bg-main-700"
            }`}
          >
            {checkingNearby ? "확인 중..." : "이 위치로 등록"}
          </button>
        </div>
      </div>

      {/* Shop Duplicate Check Modal */}
      <ShopDuplicateCheckModal
        isOpen={isDuplicateModalOpen}
        shops={
          nearbyShops?.shops.map((shop: NearbyShopResponse, index: number) => ({
            id: index,
            name: shop.name,
            mainImageUrl: shop.mainImageUrl,
            distance: 30, // TODO: 백엔드에서 distance 정보 추가 필요
          })) || []
        }
        onClose={() => setIsDuplicateModalOpen(false)}
        onSelectNotHere={handleSelectNotHere}
      />
    </div>
  );
}
