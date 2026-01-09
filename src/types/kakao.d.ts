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
        event: {
          addListener: (
            target: KakaoMap | Marker,
            type: string,
            callback: (...args: unknown[]) => void
          ) => void;
          removeListener: (
            target: KakaoMap | Marker,
            type: string,
            callback: (...args: unknown[]) => void
          ) => void;
        };
        services: {
          Places: new () => Places;
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
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

  interface LatLngBounds {
    getNorthEast: () => LatLng;
    getSouthWest: () => LatLng;
  }

  interface KakaoMap {
    setCenter: (latlng: LatLng) => void;
    getCenter: () => LatLng;
    getLevel: () => number;
    setLevel: (level: number) => void;
    getBounds: () => LatLngBounds;
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

  interface PlacesSearchOptions {
    size?: number; // 한 페이지에 보여질 목록 개수 (기본값: 15, 최대: 15)
    page?: number; // 검색할 페이지 번호 (기본값: 1)
    sort?: string; // 정렬 방식 (distance: 거리순, accuracy: 정확도순)
  }

  interface PlacesPagination {
    hasNextPage: boolean;
    gotoPage: (page: number) => void;
  }

  interface Places {
    keywordSearch: (
      keyword: string,
      callback: (data: PlaceResult[], status: string, pagination: PlacesPagination) => void,
      options?: PlacesSearchOptions
    ) => void;
  }

  interface PlaceResult {
    id: string;
    place_name: string;
    address_name: string;
    road_address_name: string;
    x: string;
    y: string;
    category_name: string;
    category_group_code: string;
    category_group_name: string;
    phone: string;
    place_url: string;
    distance: string;
  }
}

export {};
