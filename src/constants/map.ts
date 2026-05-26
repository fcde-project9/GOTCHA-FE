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

/** 클러스터 클릭 시 줌인 레벨 (구 전체가 한 화면에 들어오도록 8 사용) */
export const CLUSTER_CLICK_ZOOM_LEVEL = 8;

/** 이 레벨 이상이면 구별 클러스터를 병합 (더 축소된 상태) */
export const MERGED_CLUSTER_ZOOM_THRESHOLD = 9;
