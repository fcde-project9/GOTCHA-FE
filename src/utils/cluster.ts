import { DISTRICT_CENTER_COORDS } from "@/constants/districtClusters";
import { MERGED_CLUSTER_ZOOM_THRESHOLD } from "@/constants/map";
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

/**
 * 줌 레벨에 따라 가까운 구별 클러스터를 병합한다.
 * 줌 레벨이 MERGED_CLUSTER_ZOOM_THRESHOLD 미만이면 병합하지 않는다.
 *
 * 거리 기반 탐욕 병합: O(N²) — 클러스터 수가 적으므로(~25개) 문제 없음
 */
export function mergeNearbyClusters(
  clusters: DisplayCluster[],
  zoomLevel: number
): DisplayCluster[] {
  if (zoomLevel < MERGED_CLUSTER_ZOOM_THRESHOLD || clusters.length === 0) {
    return clusters;
  }

  // 줌 레벨이 높을수록(더 축소) 병합 반경을 넓힘
  const threshold = 0.05 + (zoomLevel - MERGED_CLUSTER_ZOOM_THRESHOLD) * 0.05;

  const used = new Array<boolean>(clusters.length).fill(false);
  const result: DisplayCluster[] = [];

  for (let i = 0; i < clusters.length; i++) {
    if (used[i]) continue;
    used[i] = true;

    const group: DisplayCluster[] = [clusters[i]];

    for (let j = i + 1; j < clusters.length; j++) {
      if (used[j]) continue;
      // 그룹 내 첫 번째 클러스터(앵커)와의 거리로 판정
      const dLat = clusters[j].latitude - clusters[i].latitude;
      const dLng = clusters[j].longitude - clusters[i].longitude;
      if (Math.sqrt(dLat * dLat + dLng * dLng) <= threshold) {
        used[j] = true;
        group.push(clusters[j]);
      }
    }

    if (group.length === 1) {
      result.push(group[0]);
    } else {
      // 가중 평균 좌표 (shopCount 기반)
      let totalCount = 0;
      let latSum = 0;
      let lngSum = 0;
      let shopLatSum = 0;
      let shopLngSum = 0;
      const names: string[] = [];

      for (const c of group) {
        totalCount += c.shopCount;
        latSum += c.latitude * c.shopCount;
        lngSum += c.longitude * c.shopCount;
        shopLatSum += c.shopCenterLatitude * c.shopCount;
        shopLngSum += c.shopCenterLongitude * c.shopCount;
        names.push(c.districtName);
      }

      const divisor = totalCount || group.length;
      result.push({
        region1DepthName: group[0].region1DepthName,
        districtName: names.join(" · "),
        shopCount: totalCount,
        latitude: latSum / divisor,
        longitude: lngSum / divisor,
        shopCenterLatitude: shopLatSum / divisor,
        shopCenterLongitude: shopLngSum / divisor,
      });
    }
  }

  return result;
}
