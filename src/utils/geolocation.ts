export interface GeolocationResult {
  latitude: number;
  longitude: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/** Geolocation 에러 코드 상수 */
export const GeolocationErrorCode = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

/** 커스텀 Geolocation 에러 타입 */
export interface GeolocationError {
  code: number;
  message: string;
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

/**
 * 현재 위치를 가져오는 순수 함수
 *
 * @param options - Geolocation 옵션
 * @returns Promise<GeolocationResult | null> - 위치 정보 또는 null
 *
 * @example
 * ```ts
 * const location = await getCurrentLocation();
 * if (location) {
 *   console.log(location.latitude, location.longitude);
 * }
 * ```
 */
export async function getCurrentLocation(
  options: GeolocationOptions = {}
): Promise<GeolocationResult | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      mergedOptions
    );
  });
}

export interface GeolocationWithErrorResult {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
}

/**
 * 현재 위치를 가져오는 함수 (에러 정보 포함)
 *
 * @param options - Geolocation 옵션
 * @returns Promise with position or error
 */
export async function getCurrentLocationWithError(
  options: GeolocationOptions = {}
): Promise<GeolocationWithErrorResult> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({
        position: null,
        error: {
          code: GeolocationErrorCode.POSITION_UNAVAILABLE,
          message: "브라우저가 위치 정보를 지원하지 않아요.",
        },
      });
      return;
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ position, error: null });
      },
      (error) => {
        resolve({
          position: null,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      },
      mergedOptions
    );
  });
}
