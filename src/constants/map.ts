/**
 * 지도 관련 상수
 */

/** 기본 위치 (강남역) - 위치 정보를 가져올 수 없을 때 사용 */
export const DEFAULT_LOCATION = {
  latitude: 37.4979,
  longitude: 127.0276,
};

/** 이 레벨 이상이면 클러스터 모드 (카카오맵: 높을수록 축소) */
export const CLUSTER_ZOOM_THRESHOLD = 7;

/** 클러스터 클릭 시 줌인 레벨 */
export const CLUSTER_CLICK_ZOOM_LEVEL = 6;
