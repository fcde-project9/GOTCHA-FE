/**
 * Kakao Maps API 타입 정의
 */

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
      };
    };
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface LatLng {
    getLat: () => number;
    getLng: () => number;
  }

  interface KakaoMap {
    setCenter: (latlng: LatLng) => void;
    getLevel: () => number;
    setLevel: (level: number) => void;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: KakaoMap;
  }

  interface Marker {
    setMap: (map: KakaoMap | null) => void;
    getPosition: () => LatLng;
  }

  interface InfoWindowOptions {
    content: string;
    position?: LatLng;
  }

  interface InfoWindow {
    open: (map: KakaoMap, marker: Marker) => void;
    close: () => void;
  }
}

export {};
