"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useKakaoLoader } from "@/hooks/useKakaoLoader";
import { MapBounds, ShopMapResponse } from "@/types/api";

// 마커 이미지 설정
const MARKER_IMAGE = {
  src: "/images/markers/shop-marker.png",
  width: 36,
  height: 48,
  // 마커 이미지의 기준점 (이미지 하단 중앙이 좌표에 위치)
  offsetX: 18,
  offsetY: 48,
};

interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
  markers?: ShopMapResponse[];
  onBoundsChange?: (bounds: MapBounds) => void;
  onMarkerClick?: (marker: ShopMapResponse) => void;
}

/**
 * 카카오맵 컴포넌트
 * Kakao Maps API를 동적으로 로드하여 지도를 표시합니다
 */
export default function KakaoMap({
  width = "100%",
  height = "400px",
  latitude = 37.497942, // 기본 위치: 강남역
  longitude = 127.027621,
  level = 5,
  markers = [],
  onBoundsChange,
  onMarkerClick,
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<KakaoMap | null>(null);
  const markersRef = useRef<Array<{ marker: Marker; handler: () => void }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 콜백을 ref로 저장하여 이벤트 리스너에서 최신 값 참조
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // 커스텀 훅으로 SDK 로드 (싱글톤 패턴으로 전역 관리)
  const { loaded: scriptLoaded, error: sdkError } = useKakaoLoader();

  // bounds 정보를 계산하여 콜백 호출
  const notifyBoundsChange = useCallback((map: KakaoMap) => {
    if (!onBoundsChangeRef.current || !map) return;

    const bounds = map.getBounds();
    const center = map.getCenter();

    const mapBounds: MapBounds = {
      northEastLat: bounds.getNorthEast().getLat(),
      northEastLng: bounds.getNorthEast().getLng(),
      southWestLat: bounds.getSouthWest().getLat(),
      southWestLng: bounds.getSouthWest().getLng(),
      centerLat: center.getLat(),
      centerLng: center.getLng(),
    };

    onBoundsChangeRef.current(mapBounds);
  }, []);

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
              const map = new window.kakao.maps.Map(mapContainer.current, options);
              mapInstance.current = map;

              // 지도 이동 완료 시 bounds 변경 알림
              window.kakao.maps.event.addListener(map, "idle", () => {
                notifyBoundsChange(map);
              });

              // 초기 bounds 알림
              notifyBoundsChange(map);

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

  // 마커 렌더링 (지도 로드 완료 후)
  useEffect(() => {
    // 지도가 로드되지 않았거나 로딩 중이면 대기
    if (!mapInstance.current || !window.kakao?.maps || isLoading) {
      return;
    }

    const map = mapInstance.current;

    // 기존 마커 및 이벤트 리스너 제거
    markersRef.current.forEach(({ marker, handler }) => {
      window.kakao.maps.event.removeListener(marker, "click", handler);
      marker.setMap(null);
    });
    markersRef.current = [];

    // 마커가 없으면 종료
    if (markers.length === 0) {
      return;
    }

    // 커스텀 마커 이미지 생성 (이미지 로드 실패 시 기본 마커 사용)
    let markerImage: MarkerImage | undefined;
    try {
      const imageSize = new window.kakao.maps.Size(MARKER_IMAGE.width, MARKER_IMAGE.height);
      const imageOption = {
        offset: new window.kakao.maps.Point(MARKER_IMAGE.offsetX, MARKER_IMAGE.offsetY),
      };
      markerImage = new window.kakao.maps.MarkerImage(MARKER_IMAGE.src, imageSize, imageOption);
    } catch (err) {
      console.warn("마커 이미지 생성 실패, 기본 마커 사용:", err);
    }

    // 새 마커 생성
    markers.forEach((markerData) => {
      // 유효하지 않은 좌표 건너뛰기 (null, undefined, NaN만 제외, 0은 유효한 좌표)
      if (!Number.isFinite(markerData.latitude) || !Number.isFinite(markerData.longitude)) {
        return;
      }

      const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude);

      const markerOptions: MarkerOptions = {
        position,
        map,
      };

      // 마커 이미지가 있으면 추가
      if (markerImage) {
        markerOptions.image = markerImage;
      }

      const marker = new window.kakao.maps.Marker(markerOptions);

      // 명명된 핸들러 생성 (이벤트 리스너 제거를 위해 필요)
      const handleMarkerClick = () => {
        onMarkerClickRef.current?.(markerData);
      };

      // 마커 클릭 이벤트 등록
      window.kakao.maps.event.addListener(marker, "click", handleMarkerClick);

      // 마커와 핸들러를 함께 저장
      markersRef.current.push({ marker, handler: handleMarkerClick });
    });

    // cleanup 함수: 컴포넌트 언마운트 또는 의존성 변경 시 실행
    return () => {
      markersRef.current.forEach(({ marker, handler }) => {
        window.kakao.maps.event.removeListener(marker, "click", handler);
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [markers, isLoading]);

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
