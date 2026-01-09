import { useState, useCallback } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface UseCurrentLocationReturn {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  getCurrentLocation: () => void;
}

/**
 * 사용자의 현재 위치를 가져오는 커스텀 훅
 *
 * @returns 현재 위치 정보, 에러, 로딩 상태 및 위치 요청 함수
 *
 * @example
 * ```tsx
 * const { location, error, isLoading, getCurrentLocation } = useCurrentLocation();
 *
 * useEffect(() => {
 *   getCurrentLocation();
 * }, []);
 * ```
 */
export function useCurrentLocation(): UseCurrentLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = "위치 정보를 가져올 수 없습니다.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "위치 정보 접근이 거부되었습니다.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다.";
            break;
          case err.TIMEOUT:
            errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
            break;
        }

        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
  };
}
