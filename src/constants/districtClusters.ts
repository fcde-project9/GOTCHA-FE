/**
 * 구/시 실제 중심 좌표 매핑 테이블
 * API 응답의 가게 평균 좌표 대신 이 좌표를 사용하여 클러스터 마커를 구 중심에 표시한다.
 * key: "region1DepthName districtName" (예: "서울 강남구")
 */
export const DISTRICT_CENTER_COORDS: Record<string, { latitude: number; longitude: number }> = {
  // 서울
  "서울 강남구": { latitude: 37.5172, longitude: 127.0473 },
  "서울 강동구": { latitude: 37.5301, longitude: 127.1238 },
  "서울 강북구": { latitude: 37.6396, longitude: 127.0254 },
  "서울 강서구": { latitude: 37.551, longitude: 126.8495 },
  "서울 관악구": { latitude: 37.4784, longitude: 126.9516 },
  "서울 광진구": { latitude: 37.5385, longitude: 127.0823 },
  "서울 구로구": { latitude: 37.4954, longitude: 126.8874 },
  "서울 금천구": { latitude: 37.4569, longitude: 126.8955 },
  "서울 노원구": { latitude: 37.6542, longitude: 127.0568 },
  "서울 도봉구": { latitude: 37.6688, longitude: 127.0471 },
  "서울 동대문구": { latitude: 37.5744, longitude: 127.0396 },
  "서울 동작구": { latitude: 37.5124, longitude: 126.9393 },
  "서울 마포구": { latitude: 37.5663, longitude: 126.9014 },
  "서울 서대문구": { latitude: 37.5791, longitude: 126.9368 },
  "서울 서초구": { latitude: 37.4837, longitude: 127.0324 },
  "서울 성동구": { latitude: 37.5633, longitude: 127.0371 },
  "서울 성북구": { latitude: 37.5894, longitude: 127.0167 },
  "서울 송파구": { latitude: 37.5146, longitude: 127.105 },
  "서울 양천구": { latitude: 37.517, longitude: 126.8665 },
  "서울 영등포구": { latitude: 37.5264, longitude: 126.8963 },
  "서울 용산구": { latitude: 37.5324, longitude: 126.99 },
  "서울 은평구": { latitude: 37.6027, longitude: 126.9291 },
  "서울 종로구": { latitude: 37.5735, longitude: 126.979 },
  "서울 중구": { latitude: 37.5641, longitude: 126.9979 },
  "서울 중랑구": { latitude: 37.6066, longitude: 127.0928 },
  // 경기
  "경기 광명시": { latitude: 37.4786, longitude: 126.8644 },
  "경기 부천시 원미구": { latitude: 37.5035, longitude: 126.766 },
  "경기 시흥시": { latitude: 37.38, longitude: 126.8028 },
  "경기 성남시 분당구": { latitude: 37.3825, longitude: 127.1195 },
  // 인천
  "인천 중구": { latitude: 37.4737, longitude: 126.6217 },
  "인천 남동구": { latitude: 37.4488, longitude: 126.7317 },
  "인천 계양구": { latitude: 37.5372, longitude: 126.7376 },
  "인천 연수구": { latitude: 37.4101, longitude: 126.6783 },
  // 충남
  "충남 천안시 서북구": { latitude: 36.8151, longitude: 127.1139 },
};
