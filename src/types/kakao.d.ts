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
        MarkerImage: new (src: string, size: Size, options?: MarkerImageOptions) => MarkerImage;
        Size: new (width: number, height: number) => Size;
        Point: new (x: number, y: number) => Point;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
        CustomOverlay: new (options: CustomOverlayOptions) => CustomOverlay;
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
          Geocoder: new () => Geocoder;
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
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClickZoom?: boolean;
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
    panBy: (x: number, y: number) => void;
    setZoomable: (zoomable: boolean) => void;
    setDraggable: (draggable: boolean) => void;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  interface MarkerImageOptions {
    offset?: Point;
    alt?: string;
    shape?: string;
    coords?: string;
  }

  interface MarkerImage {
    // MarkerImage는 Marker 생성 시 사용되는 이미지 객체
    // Kakao Maps API에서 생성된 객체로 직접 프로퍼티 접근은 제한적
    [key: string]: unknown;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: KakaoMap;
    image?: MarkerImage;
    title?: string;
    clickable?: boolean;
  }

  interface Marker {
    setMap: (map: KakaoMap | null) => void;
    getPosition: () => LatLng;
    setImage: (image: MarkerImage) => void;
  }

  interface InfoWindowOptions {
    content: string;
    position?: LatLng;
  }

  interface InfoWindow {
    open: (map: KakaoMap, marker: Marker) => void;
    close: () => void;
  }

  interface Viewpoint {
    pan: number;
    tilt: number;
    zoom: number;
    panoId?: number;
  }

  interface Roadview {
    setPanoId: (panoId: number, position: LatLng) => void;
    getPanoId: () => number;
    setViewpoint: (viewpoint: Viewpoint) => void;
    getViewpoint: () => Viewpoint;
    getPosition: () => LatLng;
  }

  interface CustomOverlayOptions {
    content: Node | string;
    position: LatLng | Viewpoint;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
    map?: KakaoMap | Roadview;
  }

  interface CustomOverlay {
    setMap: (map: KakaoMap | Roadview | null) => void;
    getMap: () => KakaoMap | Roadview | null;
    setPosition: (position: LatLng) => void;
    getPosition: () => LatLng;
    setContent: (content: Node | string) => void;
    getContent: () => Node | string;
    setZIndex: (zIndex: number) => void;
    getZIndex: () => number;
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

  interface GeocoderResult {
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    };
    road_address: {
      address_name: string;
      building_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      zone_no: string;
    } | null;
  }

  interface Geocoder {
    coord2Address: (
      lng: number,
      lat: number,
      callback: (result: GeocoderResult[], status: string) => void
    ) => void;
  }
}

// kakao namespace 선언
declare namespace kakao {
  namespace maps {
    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      getLevel(): number;
      setLevel(level: number): void;
      getBounds(): LatLngBounds;
      panBy(x: number, y: number): void;
      panTo(latlng: LatLng): void;
    }
  }
}

export {};
