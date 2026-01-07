"use client";

import { useEffect, useRef, useState } from "react";
import { useKakaoLoader } from "@/hooks/useKakaoLoader";

interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
}

/**
 * 카카오맵 컴포넌트
 * Kakao Maps API를 동적으로 로드하여 지도를 표시합니다
 */
export default function KakaoMap({
  width = "100%",
  height = "400px",
  latitude = 37.558907, // 기본 위치: 서울 중심
  longitude = 126.978305,
  level = 3,
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<KakaoMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 커스텀 훅으로 SDK 로드 (싱글톤 패턴으로 전역 관리)
  const { loaded: scriptLoaded, error: sdkError } = useKakaoLoader();

  // 지도 초기화 (한 번만 실행)
  // latitude, longitude, level은 초기값만 사용하고 이후 업데이트는 별도 useEffect에서 처리
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 50; // 최대 5초 대기 (100ms * 50)

    if (!scriptLoaded) {
      return;
    }

    const initMap = () => {
      if (!isMounted) {
        return;
      }

      if (!mapContainer.current) {
        // 재시도 횟수 제한
        if (retryCount >= MAX_RETRIES) {
          if (isMounted) {
            setMapError("지도 컨테이너를 찾을 수 없습니다.");
            setIsLoading(false);
          }
          return;
        }
        retryCount++;
        timeoutId = setTimeout(initMap, 100);
        return;
      }

      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (mapContainer.current && isMounted) {
            try {
              const options = {
                center: new window.kakao.maps.LatLng(latitude, longitude),
                level: level,
              };
              // 지도 인스턴스를 ref에 저장
              mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options);
              if (isMounted) {
                setIsLoading(false);
              }
            } catch (err) {
              if (isMounted) {
                setMapError(`지도 초기화 실패: ${err}`);
                setIsLoading(false);
              }
            }
          }
        });
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // 지도 인스턴스 정리
      // Kakao Maps API는 명시적인 destroy 메서드가 없지만, ref를 null로 설정
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

  // props 변경 시 지도 업데이트 (재생성하지 않음)
  useEffect(() => {
    if (!mapInstance.current) {
      return;
    }

    try {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstance.current.setCenter(newCenter);
      mapInstance.current.setLevel(level);
    } catch (err) {
      setMapError(`지도 업데이트 실패: ${err}`);
    }
  }, [latitude, longitude, level]);

  // SDK 에러와 지도 에러를 통합
  const error = sdkError || mapError;

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* 실제 지도 컨테이너 (항상 렌더링) */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* 로딩 오버레이 */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          지도 로딩 중...
        </div>
      )}

      {/* 에러 오버레이 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
