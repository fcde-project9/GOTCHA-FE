import { useState, useCallback } from "react";
import { getCurrentLocationWithError, GeolocationResult } from "@/utils/geolocation";

interface UseCurrentLocationReturn {
  location: GeolocationResult | null;
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
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { position, error: geoError } = await getCurrentLocationWithError();

    if (position) {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } else if (geoError) {
      let errorMessage = "위치 정보를 가져올 수 없습니다.";

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          errorMessage = "위치 정보 접근이 거부되었습니다.";
          break;
        case geoError.POSITION_UNAVAILABLE:
          errorMessage = "위치 정보를 사용할 수 없습니다.";
          break;
        case geoError.TIMEOUT:
          errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
          break;
      }

      setError(errorMessage);
    }

    setIsLoading(false);
  }, []);

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
  };
}
