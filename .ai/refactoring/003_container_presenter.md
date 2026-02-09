# Refactoring #003: Container/Presenter (Custom Hooks)

> 작성일: 2026-02-04
> 상태: 완료

## 개요

홈 페이지(673줄)의 비즈니스 로직을 Custom Hooks로 분리하여 관심사를 분리하고 코드 가독성을 향상시킵니다.

## 배경 및 문제점

### 기존 문제

`src/app/home/page.tsx` 파일이 673줄로 비대해진 상태:

```
- 20개 이상의 useState 훅
- 10개 이상의 useEffect 훅
- 복잡하게 얽힌 상태 의존성
- 지도, 검색, 바텀시트, 위치 추적 등 여러 관심사가 혼재
```

문제점:

- 코드 가독성 저하
- 테스트 어려움
- 상태 간 의존성 파악 어려움
- 유지보수 시 사이드 이펙트 발생 가능성

## 해결 방안

### Container/Presenter 패턴 적용

React에서 전통적인 MVC 대신 **Custom Hooks를 Container로 활용**하는 패턴을 적용:

```
Container (Custom Hooks)     Presenter (Components)
├── useHomeMapState         →  지도 상태/마커 렌더링
├── useHomeSearch           →  검색바/검색 결과
├── useHomeBottomSheet      →  바텀시트 전환
└── useLocationTracking     →  위치 버튼/마커
```

## 변경 내역

### 새로 생성된 파일

| 파일                                    | 줄 수 | 설명                                 |
| --------------------------------------- | ----- | ------------------------------------ |
| `src/hooks/home/useHomeMapState.ts`     | 178줄 | 지도 중심, 줌, 영역, 마커, 재검색    |
| `src/hooks/home/useHomeSearch.ts`       | 122줄 | 검색 모드, 검색어, 결과, 카카오 연동 |
| `src/hooks/home/useHomeBottomSheet.ts`  | 154줄 | 바텀시트 상태, 애니메이션, 전환      |
| `src/hooks/home/useLocationTracking.ts` | 218줄 | 위치 권한, 디바이스 방향, 현재 위치  |
| `src/hooks/home/index.ts`               | 4줄   | Export 모음                          |

### 수정된 파일

| 파일                    | Before | After | 변화                   |
| ----------------------- | ------ | ----- | ---------------------- |
| `src/app/home/page.tsx` | 673줄  | 376줄 | -44%                   |
| `src/hooks/index.ts`    | -      | -     | home hooks export 추가 |

## 분리된 관심사

### 1. useHomeMapState (지도 상태)

```typescript
const mapState = useHomeMapState();

// 제공하는 값/함수
mapState.mapCenter; // 지도 중심 좌표
mapState.setMapCenter(); // 중심 설정
mapState.mapLevel; // 줌 레벨
mapState.setMapLevel(); // 줌 설정
mapState.shops; // UI용 가게 목록
mapState.markers; // 마커 데이터
mapState.isShopsLoading; // 로딩 상태
mapState.showReloadButton; // 재검색 버튼 표시
mapState.handleBoundsChange; // 영역 변경 핸들러
mapState.handleReloadArea; // 재검색 핸들러
```

### 2. useHomeSearch (검색)

```typescript
const search = useHomeSearch();

// 제공하는 값/함수
search.isSearching; // 검색 모드 여부
search.searchQuery; // 검색어
search.results; // 검색 결과
search.handleSearchClick; // 검색 모드 시작
search.handleSearchCancel; // 검색 취소
search.handleResultClick; // 결과 선택
search.setSearchQuery; // 검색어 변경
```

### 3. useHomeBottomSheet (바텀시트)

```typescript
const bottomSheet = useHomeBottomSheet();

// 제공하는 값/함수
bottomSheet.selectedShop; // 선택된 가게
bottomSheet.showPreviewSheet; // 미리보기 표시
bottomSheet.isListSheetLeaving; // 리스트 퇴장 애니메이션
bottomSheet.handleMarkerClick; // 마커 클릭
bottomSheet.handleMapClick; // 지도 클릭
bottomSheet.handlePreviewClose; // 미리보기 닫기
bottomSheet.buttonBottom; // 버튼 위치
bottomSheet.isButtonVisible; // 버튼 표시
```

### 4. useLocationTracking (위치)

```typescript
const location = useLocationTracking(onLocationUpdate);

// 제공하는 값/함수
location.currentLocation; // 현재 위치 (마커용)
location.locationDenied; // 권한 거부 여부
location.showLocationModal; // 권한 모달
location.handleCurrentLocation; // 현재 위치 버튼
location.handlePermissionGranted; // 권한 허용 콜백
```

## 사용 가이드

### 리팩토링된 Home 컴포넌트 구조

```typescript
export default function Home() {
  // 1. Custom Hooks (Container 역할)
  const mapState = useHomeMapState();
  const search = useHomeSearch();
  const bottomSheet = useHomeBottomSheet();
  const locationTracking = useLocationTracking(handleLocationUpdate);

  // 2. 훅 간 연결 로직 (최소한의 조정)
  const handleLocationUpdate = useCallback(...);
  const handleResultClick = useCallback(...);

  // 3. Presenter 렌더링 (순수 UI)
  return (
    <>
      <KakaoMap ... />
      <SearchBar ... />
      <ShopListBottomSheet ... />
    </>
  );
}
```

### Presenter 컴포넌트 분리

페이지 내부에 작은 Presenter 컴포넌트들도 분리:

```typescript
// 검색바 - 순수 UI 컴포넌트
function SearchBar({ isSearching, searchQuery, onSearchClick, ... }) {
  return <div>...</div>;
}

// 재검색 버튼
function ReloadButton({ onClick }) {
  return <button>이 지역 재검색</button>;
}

// 현재 위치 버튼
function CurrentLocationButton({ onClick, bottom, isVisible }) {
  return <button>현재 위치</button>;
}

// 검색 오버레이
function SearchOverlay({ searchQuery, results, onResultClick }) {
  return <div>...</div>;
}
```

## 효과

### 코드 구조 개선

| 항목                | Before   | After          |
| ------------------- | -------- | -------------- |
| 메인 컴포넌트 줄 수 | 673줄    | 376줄 (-44%)   |
| useState 훅 수      | 20+개    | 1개 (스플래시) |
| useEffect 훅 수     | 10+개    | 3개            |
| 관심사 수           | 4개 혼재 | 4개 분리       |

### 품질 개선

- **가독성**: 메인 컴포넌트가 UI 렌더링에만 집중
- **재사용성**: 각 훅을 다른 페이지에서도 활용 가능
- **테스트 용이성**: 훅 단위로 독립적 테스트 가능
- **유지보수성**: 관심사별로 수정 범위 명확

### 파일 구조

```
src/
├── app/home/
│   └── page.tsx          # 376줄 (Presenter)
└── hooks/home/
    ├── index.ts
    ├── useHomeMapState.ts     # 지도 상태
    ├── useHomeSearch.ts       # 검색 로직
    ├── useHomeBottomSheet.ts  # 바텀시트
    └── useLocationTracking.ts # 위치 추적
```

## 향후 개선 가능 사항

1. **Presenter 컴포넌트 파일 분리**: 현재 page.tsx 내 정의된 SearchBar, ReloadButton 등을 별도 파일로 분리
2. **훅 간 의존성 최소화**: handleLocationUpdate 같은 연결 로직을 훅 내부로 이동
3. **테스트 코드 작성**: 각 훅별 단위 테스트 추가
