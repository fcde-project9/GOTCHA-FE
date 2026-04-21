import { DISTRICT_CENTER_COORDS } from "@/constants/districtClusters";
import type { DistrictClusterResponse } from "@/types/api";

/** 마커 표시 좌표(구 중심)와 클릭 이동 좌표(가게 평균)를 분리한 클러스터 */
export interface DisplayCluster extends DistrictClusterResponse {
  /** 클릭 시 이동할 좌표 (가게들의 평균 위치) */
  shopCenterLatitude: number;
  shopCenterLongitude: number;
}

/**
 * 클러스터의 마커 표시 좌표를 구 중심으로 교체하고,
 * 원래 가게 평균 좌표는 shopCenter로 보존한다.
 *
 * - latitude/longitude → 구 중심 (마커 표시용)
 * - shopCenterLatitude/shopCenterLongitude → 가게 평균 (클릭 이동용)
 */
export function applyCenterCoords(clusters: DistrictClusterResponse[]): DisplayCluster[] {
  return clusters.map((cluster) => {
    const key = `${cluster.region1DepthName} ${cluster.districtName}`;
    const center = DISTRICT_CENTER_COORDS[key];

    return {
      ...cluster,
      shopCenterLatitude: cluster.latitude,
      shopCenterLongitude: cluster.longitude,
      ...(center && {
        latitude: center.latitude,
        longitude: center.longitude,
      }),
    };
  });
}
