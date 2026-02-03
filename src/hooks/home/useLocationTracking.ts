"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCurrentLocation } from "@/hooks";
import { trackLocationPermission } from "@/utils/analytics";

interface CurrentLocationState {
  latitude: number;
  longitude: number;
  heading: number | null;
}

interface UseLocationTrackingReturn {
  /** 현재 위치 (마커 표시용) */
  currentLocation: CurrentLocationState | null;
  /** 위치 권한 거부 여부 */
  locationDenied: boolean;
  /** 위치 권한 모달 표시 여부 */
  showLocationModal: boolean;
  /** 위치 권한 모달 닫기 */
  closeLocationModal: () => void;
  /** 현재 위치 버튼 클릭 핸들러 */
  handleCurrentLocation: () => Promise<void>;
  /** 위치 권한 허용 시 콜백 */
  handlePermissionGranted: (position: GeolocationPosition) => Promise<void>;
  /** 사용자 위치 (초기 로드용) */
  userLocation: { latitude: number; longitude: number } | null;
  /** 위치를 처음 받았는지 여부 */
  hasReceivedLocation: boolean;
  /** 위치 수신 완료 표시 */
  setHasReceivedLocation: (value: boolean) => void;
}

/**
 * 위치 추적 및 권한 관리 Hook
 * - 현재 위치 가져오기
 * - 디바이스 방향 추적
 * - 위치 권한 상태 관리
 */
export function useLocationTracking(
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void
): UseLocationTrackingReturn {
  const { location: userLocation, getCurrentLocation } = useCurrentLocation();

  const [currentLocation, setCurrentLocation] = useState<CurrentLocationState | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasReceivedLocation, setHasReceivedLocation] = useState(false);

  // 디바이스 방향 이벤트 핸들러 ref (메모리 누수 방지)
  const orientationHandlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  // iOS 13+ 디바이스 방향 권한 상태 캐시
  const orientationPermissionRef = useRef<"granted" | "denied" | "pending">("pending");

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

  // iOS 13+ 디바이스 방향 권한 요청 여부 확인
  const requiresOrientationPermission = useCallback(() => {
    return (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === "function"
    );
  }, []);

  // iOS 13+ 디바이스 방향 권한 요청 (반드시 사용자 제스처에서 직접 호출해야 함)
  const requestOrientationPermission = useCallback(async (): Promise<boolean> => {
    // 이미 권한 상태가 결정된 경우 캐시된 값 반환
    if (orientationPermissionRef.current === "granted") {
      return true;
    }
    if (orientationPermissionRef.current === "denied") {
      return false;
    }

    // iOS 13+ 권한 요청이 필요하지 않은 경우 (Android 등)
    if (!requiresOrientationPermission()) {
      orientationPermissionRef.current = "granted";
      return true;
    }

    // iOS 13+: 사용자 제스처 컨텍스트에서 권한 요청
    try {
      const permission = await (
        DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission();

      if (permission === "granted") {
        orientationPermissionRef.current = "granted";
        return true;
      } else {
        orientationPermissionRef.current = "denied";
        return false;
      }
    } catch (error) {
      console.error("DeviceOrientationEvent 권한 요청 실패:", error);
      orientationPermissionRef.current = "denied";
      return false;
    }
  }, [requiresOrientationPermission]);

  // 디바이스 방향 감지 시작 (권한이 이미 부여된 상태에서만 호출)
  const startDeviceOrientationTracking = useCallback(
    (currentLoc: { latitude: number; longitude: number }) => {
      // iOS 13+에서 권한이 부여되지 않은 경우 리스너 등록 스킵
      if (requiresOrientationPermission() && orientationPermissionRef.current !== "granted") {
        return;
      }

      // 기존 리스너 제거 (중복 방지)
      if (orientationHandlerRef.current) {
        window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        let heading: number | null = null;

        if ("webkitCompassHeading" in event && typeof event.webkitCompassHeading === "number") {
          // iOS: webkitCompassHeading은 0-360도, 북쪽 기준
          heading = event.webkitCompassHeading;
        } else if (event.absolute && event.alpha != null) {
          // Android: alpha는 0-360도, 시계 반대 방향
          heading = (360 - event.alpha) % 360;
        }

        if (heading != null) {
          setCurrentLocation((prev) =>
            prev
              ? { ...prev, heading }
              : { latitude: currentLoc.latitude, longitude: currentLoc.longitude, heading }
          );
        }
      };

      // 핸들러를 ref에 저장
      orientationHandlerRef.current = handleOrientation;

      // 리스너 등록
      window.addEventListener("deviceorientation", orientationHandlerRef.current, true);
    },
    [requiresOrientationPermission]
  );

  // 컴포넌트 언마운트 시 리스너 정리
  useEffect(() => {
    return () => {
      if (orientationHandlerRef.current) {
        window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
        orientationHandlerRef.current = null;
      }
    };
  }, []);

  // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }

    // iOS 13+: 사용자 제스처 컨텍스트에서 직접 권한 요청
    await requestOrientationPermission();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // 콜백으로 위치 업데이트 전달
        onLocationUpdate?.(newLocation);

        // 현재 위치 마커 표시
        const heading = position.coords.heading;
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: heading != null && !isNaN(heading) ? heading : null,
        });

        // 디바이스 방향 감지 시작 (권한이 이미 부여된 상태)
        startDeviceOrientationTracking(newLocation);
      },
      (err) => {
        console.error("위치 정보를 가져올 수 없어요:", err);

        // 위치 권한 거부 시만 설정 안내 모달 표시
        if (err.code === err.PERMISSION_DENIED) {
          trackLocationPermission(false);
          setLocationDenied(true);
          try {
            localStorage.setItem("locationPermissionDenied", "true");
          } catch {
            // localStorage 접근 불가 시 무시
          }
          setShowLocationModal(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [onLocationUpdate, requestOrientationPermission, startDeviceOrientationTracking]);

  // 위치 권한 허용 시 콜백
  const handlePermissionGranted = useCallback(
    async (position: GeolocationPosition) => {
      trackLocationPermission(true);

      // iOS 13+: 사용자 제스처 컨텍스트에서 직접 권한 요청
      await requestOrientationPermission();

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      onLocationUpdate?.(newLocation);

      const heading = position.coords.heading;
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: heading != null && !isNaN(heading) ? heading : null,
      });

      // 디바이스 방향 감지 시작 (권한이 이미 부여된 상태)
      startDeviceOrientationTracking(newLocation);

      // 권한 허용 시 denied 상태 초기화
      setLocationDenied(false);
      try {
        localStorage.removeItem("locationPermissionDenied");
      } catch {
        // localStorage 접근 불가 시 무시
      }
    },
    [onLocationUpdate, requestOrientationPermission, startDeviceOrientationTracking]
  );

  // 위치 권한 모달 닫기
  const closeLocationModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  // 초기 위치 수신 시 현재 위치 마커 표시
  useEffect(() => {
    if (userLocation && !currentLocation) {
      setCurrentLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        heading: null,
      });
    }
  }, [userLocation, currentLocation]);

  return {
    currentLocation,
    locationDenied,
    showLocationModal,
    closeLocationModal,
    handleCurrentLocation,
    handlePermissionGranted,
    userLocation,
    hasReceivedLocation,
    setHasReceivedLocation,
  };
}
