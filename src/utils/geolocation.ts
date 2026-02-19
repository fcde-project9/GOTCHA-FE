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
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * 현재 위치를 가져오는 순수 함수
 * 네이티브 앱에서는 Capacitor Geolocation 플러그인 사용 (WKWebView 이중 팝업 방지)
 *
 * @param options - Geolocation 옵션
 * @returns Promise<GeolocationResult | null> - 위치 정보 또는 null
 */
export async function getCurrentLocation(
  options: GeolocationOptions = {}
): Promise<GeolocationResult | null> {
  const { isNativeApp } = await import("./platform");

  if (isNativeApp()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const position = await Geolocation.getCurrentPosition(options);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  }

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
  const { isNativeApp } = await import("./platform");

  if (isNativeApp()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const position = await Geolocation.getCurrentPosition(options);
      return { position: position as unknown as GeolocationPosition, error: null };
    } catch {
      return {
        position: null,
        error: {
          code: GeolocationErrorCode.PERMISSION_DENIED,
          message: "위치 정보 접근이 거부되었어요.",
        },
      };
    }
  }

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
