# 검색 알고리즘 문서

## 개요

GOTCHA 서비스의 지역/지하철역 검색 기능은 카카오 Places API를 활용하여 서울 지역 내 지하철역과 행정구역을 검색합니다. 사용자 경험을 최적화하기 위해 검색어 길이에 따른 차별화된 전략과 관련도 기반 정렬을 적용합니다.

## 핵심 기능

### 1. 서울 지역 제한

- 모든 검색 결과는 서울 지역으로 제한됩니다
- 주소가 "서울"로 시작하는 장소만 허용
- 서울 외 지역(경기도, 인천 등)은 자동 필터링

### 2. 검색 대상

**허용되는 장소:**

- ✅ 지하철역 (SW8 카테고리)
- ✅ 행정구역 (구, 동, 시, 읍, 면, 리)
- ✅ 도로명 (강남대로, 테헤란로 등)
- ✅ 지역명 자체 (강남, 홍대, 신촌 등)

**제외되는 장소:**

- ❌ 음식점, 카페, 편의점, 마트
- ❌ 병원, 약국, 학교, 학원
- ❌ 관광명소 (광장, 동상, 둘레길 등)
- ❌ 자연지형 (산, 하천)
- ❌ 카지노, 투어센터, 안내소

## 검색 전략

### 검색어 길이별 전략

#### 1글자 검색어 (예: "강")

```typescript
searchKeywords = ["강역", "강구", "강동", "강로", "강"];
maxPages = 5; // 최대 75개 조회 (5페이지 × 15개)
resultLimit = 10; // 상위 10개 표시
```

**특징:**

- 다양한 접미사 조합으로 확장 검색
- 많은 페이지를 조회하여 충분한 결과 확보
- 간결한 지역명 우선 표시

#### 2글자 검색어 (예: "강남")

```typescript
searchKeywords = ["강남역", "강남구", "강남동", "강남"];
maxPages = 4; // 최대 60개 조회
resultLimit = 15; // 상위 15개 표시
```

**특징:**

- 역/구/동 조합으로 확장
- 적당한 페이지 수로 빠른 검색
- 구체적인 결과 제공

#### 3글자 이상 검색어 (예: "강남역")

```typescript
searchKeywords = ["강남역", "강남역역", "강남역구", "강남역동"];
maxPages = 3; // 최대 45개 조회
resultLimit = 15; // 상위 15개 표시
```

**특징:**

- 정확한 매칭 우선
- 빠른 검색 속도
- 관련성 높은 결과만 표시

## 관련도 점수 알고리즘

### 점수 계산 기준

| 조건                | 점수  | 설명                    |
| ------------------- | ----- | ----------------------- |
| 정확히 일치         | +1100 | "강남" 검색 시 "강남"   |
| 검색어 + "역"       | +1000 | "강남" 검색 시 "강남역" |
| 검색어 + "구"       | +950  | "강남" 검색 시 "강남구" |
| 검색어 + "동"       | +900  | "강남" 검색 시 "강남동" |
| 검색어 + "시"       | +850  | "강" 검색 시 "강시"     |
| 시작 위치 (1-2글자) | +700  | 짧은 검색어로 시작      |
| 시작 위치 (3글자+)  | +500  | 긴 검색어로 시작        |
| 지하철역 (SW8)      | +400  | 지하철역 카테고리       |
| "역" 포함           | +350  | 역 관련 장소            |
| "구" 포함           | +300  | 구 단위 행정구역        |
| "동" 포함           | +250  | 동 단위 행정구역        |
| "시" 포함           | +200  | 시 단위 행정구역        |
| "읍/면" 포함        | +150  | 읍/면 단위              |

### 점수 조정 로직

#### 짧은 검색어 (1-2글자)

```typescript
// 장소명이 짧을수록 높은 점수
const lengthPenalty = Math.max(0, placeName.length - keyword.length - 2) * 10;
score -= lengthPenalty;
```

#### 긴 검색어 (3글자 이상)

```typescript
// 검색어와 유사한 길이 선호
const lengthRatio = keyword.length / placeName.length;
score += lengthRatio * 150;
```

#### 포함 위치 페널티

```typescript
// 검색어가 중간/끝에 있으면 감점
const keywordIndex = normalizedPlaceName.indexOf(normalizedKeyword);
if (keywordIndex > 0) {
  score -= keywordIndex * 20;
}
```

## 지역명 자동 합성

카카오 API가 "강남" 같은 지역명 자체를 반환하지 않는 경우, 주소 정보를 기반으로 자동 생성합니다.

### 합성 로직

```typescript
// 주소에 "강남구" 또는 "강남동"이 포함된 장소 찾기
const basePlace = uniquePlaces.find((p) => {
  const addr = p.address_name || "";
  return addr.includes("서울") && (addr.includes(keyword + "구") || addr.includes(keyword + "동"));
});

if (basePlace) {
  // "강남" 지역명 생성
  syntheticPlaces.push({
    id: `synthetic_${keyword}`,
    place_name: keyword,
    address_name: basePlace.address_name,
    x: basePlace.x,
    y: basePlace.y,
    relevanceScore: 1100, // 최우선
  });
}
```

### 예시

**"강남" 검색 시:**

1. "강남역 2호선" 발견 (주소: 서울 강남구 역삼동 858)
2. 주소에서 "강남구" 확인
3. "강남" 지역명 자동 생성
4. 최상단에 표시

## 필터링 프로세스

### 1단계: place_name 검색어 포함 확인

place_name은 데이터 중 화면에 보여지게 될 텍스트

```typescript
if (!normalizedPlaceName.includes(normalizedKeyword)) {
  return false;
}
```

### 2단계: 서울 지역 확인

```typescript
function isSeoulArea(place: any): boolean {
  const addressName = place.address_name || "";
  const roadAddressName = place.road_address_name || "";
  return addressName.startsWith("서울") || roadAddressName.startsWith("서울");
}
```

### 3단계: 지하철역 우선 허용

```typescript
if (categoryGroup === "SW8") {
  return true; // 지하철역은 무조건 허용
}
```

### 4단계: 매장 제외

```typescript
const isShop =
  categoryName.includes("음식점") ||
  categoryName.includes("카페") ||
  categoryName.includes("상점") ||
  // ... 기타 매장 카테고리
```

### 5단계: 자연지형 제외

```typescript
const isNaturalFeature =
  categoryName.includes("산,계곡") ||
  categoryName.includes("하천") ||
  (placeName.includes("강") && !placeName.includes("역") && !placeName.includes("구"));
```

### 6단계: 지역명 확인

```typescript
const hasRegionSuffix =
  placeName.includes("역") ||
  placeName.includes("동") ||
  placeName.includes("구") ||
  placeName.includes("시") ||
  placeName.includes("읍") ||
  placeName.includes("면") ||
  placeName.includes("리") ||
  placeName.includes("로");

if (hasRegionSuffix) {
  return true; // 지역명 접미사가 있으면 허용
}
```

### 7단계: 관광명소 제외

```typescript
const isExcludedPlace =
  placeName.includes("광장") ||
  placeName.includes("소녀상") ||
  placeName.includes("동상") ||
  placeName.includes("둘레길") ||
  // ... 기타 관광명소
```

### 8단계: 주소 기반 지역명 확인

```typescript
const hasAddressInfo =
  addressName.includes("구") || addressName.includes("동") || addressName.includes("시");

if (hasAddressInfo) {
  return true; // 주소에 행정구역이 있으면 허용
}
```

## 검색 결과 예시

### "강" 검색 결과 (10개)

1. 강남역 (1400점) - 정확히 일치 + 지하철역
2. 강동역 (1400점) - 정확히 일치 + 지하철역
3. 강서구 (1250점) - 정확히 일치 + 구
4. 강북역 (1200점) - 정확히 일치 + 지하철역
5. 강변역 (1200점) - 시작 위치 + 지하철역
6. 강일역 (1200점) - 시작 위치 + 지하철역
7. 강남대로 (1000점) - 시작 위치 + 도로명
8. 강동구 (950점) - 시작 위치 + 구
9. 강남구 (950점) - 시작 위치 + 구
10. 강촌역 (900점) - 시작 위치 + 지하철역

### "강남" 검색 결과 (15개)

1. 강남 (1100점) - 합성된 지역명
2. 강남역 2호선 (1070점) - 정확히 일치 + 지하철역
3. 강남역 신분당선 (1060점) - 정확히 일치 + 지하철역
4. 강남구청역 (1050점) - 시작 위치 + 지하철역
5. 강남구청 (1000점) - 시작 위치 + 행정기관
6. 강남대로 (950점) - 시작 위치 + 도로명
7. 강남터미널 (900점) - 시작 위치
8. ... (기타 강남 관련 장소)

## 성능 최적화

### 병렬 검색

```typescript
// 모든 키워드를 동시에 검색
searchKeywords.forEach((searchKeyword) => {
  searchWithKeyword(searchKeyword);
});
```

### 중복 제거

```typescript
const uniquePlaces = scoredPlaces.filter(
  (place, index, self) => index === self.findIndex((p) => p.place_name === place.place_name)
);
```

### 결과 제한

- 짧은 검색어 (1-2글자): 상위 10개
- 긴 검색어 (3글자 이상): 상위 15개

## 참고 자료

- [Kakao Maps API 문서](https://apis.map.kakao.com/web/)
- [Places API - 키워드 검색](https://apis.map.kakao.com/web/sample/keywordBasic/)
- 구현 파일: `src/hooks/useKakaoPlaces.ts`
