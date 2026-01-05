"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 1. 스크립트 로드 (한 번만 실행)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!apiKey) {
      setError("카카오맵 API 키가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    // 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      setScriptLoaded(true);
      return;
    }

    // 스크립트 동적 추가
    const script = document.createElement("script");
    const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setError("카카오맵 SDK 로드에 실패했습니다.");
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // 2. 지도 초기화 (스크립트 로드 완료 후 + mapContainer 준비 후)
  useEffect(() => {
    if (!scriptLoaded) {
      return;
    }

    const initMap = () => {
      if (!mapContainer.current) {
        // DOM이 준비될 때까지 재시도
        setTimeout(initMap, 100);
        return;
      }

      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (mapContainer.current) {
            try {
              const options = {
                center: new window.kakao.maps.LatLng(latitude, longitude),
                level: level,
              };
              new window.kakao.maps.Map(mapContainer.current, options);
              setIsLoading(false);
            } catch (err) {
              setError(`지도 초기화 실패: ${err}`);
              setIsLoading(false);
            }
          }
        });
      }
    };

    initMap();
  }, [scriptLoaded, latitude, longitude, level]);

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* 실제 지도 컨테이너 (항상 렌더링) */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* 로딩 오버레이 */}
      {isLoading && !error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#6b7280",
          }}
        >
          지도 로딩 중...
        </div>
      )}

      {/* 에러 오버레이 */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
