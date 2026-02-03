# Refactoring #001: Query Key Factory 도입

> 작성일: 2026-02-03
> 상태: 완료

## 개요

React Query의 queryKey를 중앙에서 관리하는 Query Key Factory 패턴을 도입했습니다.

## 배경 및 문제점

### 기존 문제

1. **Query Key 흩어짐**: 각 query/mutation 파일에 문자열로 직접 작성
2. **네이밍 불일치**: `["shop", ...]` vs `["shops", ...]` 혼재
3. **타입 안전성 부재**: 오타 발생 시 런타임에서야 발견
4. **캐시 무효화 어려움**: 관련 쿼리를 무효화할 때 키를 기억해야 함

### 기존 코드 예시

```typescript
// useShopDetail.ts
queryKey: ["shop", shopId, sortBy]; // "shop" (단수)

// useShopsInBounds.ts
queryKey: ["shops", "map", bounds]; // "shops" (복수)

// useToggleFavorite.ts - invalidation
queryClient.invalidateQueries({ queryKey: ["shops", "map"] }); // 문자열 직접 사용
```

## 해결 방안

### Query Key Factory 패턴

`src/api/queryKeys.ts` 파일에서 모든 query key를 중앙 관리합니다.

```typescript
export const queryKeys = {
  shops: {
    all: ["shops"] as const,
    map: (bounds) => [...queryKeys.shops.all, "map", bounds] as const,
    detail: (shopId, sortBy) => [...queryKeys.shops.all, "detail", shopId, sortBy] as const,
    nearby: (lat, lng) => [...queryKeys.shops.all, "nearby", lat, lng] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    list: () => [...queryKeys.favorites.all, "list"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    byShop: (shopId) => [...queryKeys.reviews.all, "shop", shopId] as const,
    list: (shopId, sortBy, page, size) =>
      [...queryKeys.reviews.byShop(shopId), sortBy, page, size] as const,
    infinite: (shopId, sortBy, size) =>
      [...queryKeys.reviews.byShop(shopId), "infinite", sortBy, size] as const,
  },
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
    myReports: () => [...queryKeys.user.all, "reports"] as const,
  },
} as const;
```

## 변경 내역

### 생성된 파일

| 파일                   | 설명                   |
| ---------------------- | ---------------------- |
| `src/api/queryKeys.ts` | Query Key Factory 정의 |

### 수정된 파일

| 파일                                                   | 변경 내용                           |
| ------------------------------------------------------ | ----------------------------------- |
| `src/api/queries/useShopsInBounds.ts`                  | `queryKeys.shops.map()` 사용        |
| `src/api/queries/useCheckNearbyShops.ts`               | `queryKeys.shops.nearby()` 사용     |
| `src/api/queries/useShopDetail.ts`                     | `queryKeys.shops.detail()` 사용     |
| `src/api/queries/useFavorites.ts`                      | `queryKeys.favorites.all` 사용      |
| `src/api/queries/useReviews.ts`                        | `queryKeys.reviews.list()` 사용     |
| `src/api/queries/useInfiniteReviews.ts`                | `queryKeys.reviews.infinite()` 사용 |
| `src/api/queries/useUser.ts`                           | `queryKeys.user.me()` 사용          |
| `src/api/queries/useMyReports.ts`                      | `queryKeys.user.myReports()` 사용   |
| `src/api/mutations/useToggleFavorite.ts`               | invalidation 시 `queryKeys` 사용    |
| `src/api/mutations/useUpdateNickname.ts`               | invalidation 시 `queryKeys` 사용    |
| `src/api/mutations/useUpdateProfileImage.ts`           | invalidation 시 `queryKeys` 사용    |
| `src/api/mutations/useUpdateProfileImageWithUpload.ts` | invalidation 시 `queryKeys` 사용    |

### Query Key 변경 매핑

| Before                                          | After                                                |
| ----------------------------------------------- | ---------------------------------------------------- |
| `["shops", "map", bounds]`                      | `queryKeys.shops.map(bounds)`                        |
| `["shops", "nearby", lat, lng]`                 | `queryKeys.shops.nearby(lat, lng)`                   |
| `["shop", shopId, sortBy]`                      | `queryKeys.shops.detail(shopId, sortBy)`             |
| `["favorites"]`                                 | `queryKeys.favorites.all`                            |
| `["reviews", shopId, sortBy, page, size]`       | `queryKeys.reviews.list(shopId, sortBy, page, size)` |
| `["reviews", "infinite", shopId, sortBy, size]` | `queryKeys.reviews.infinite(shopId, sortBy, size)`   |
| `["user", "me"]`                                | `queryKeys.user.me()`                                |
| `["myReports"]`                                 | `queryKeys.user.myReports()`                         |

## 사용 가이드

### Query에서 사용

```typescript
import { queryKeys } from "@/api/queryKeys";

export const useShopDetail = (shopId: number) => {
  return useQuery({
    queryKey: queryKeys.shops.detail(shopId),
    queryFn: async () => { ... },
  });
};
```

### 캐시 무효화에서 사용

```typescript
import { queryKeys } from "@/api/queryKeys";

// 특정 쿼리만 무효화
queryClient.invalidateQueries({ queryKey: queryKeys.shops.detail(shopId) });

// 관련 쿼리 전체 무효화 (하위 키 포함)
queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
```

### 새 Query 추가 시

1. `src/api/queryKeys.ts`에 새 키 추가
2. query/mutation 파일에서 import하여 사용

```typescript
// queryKeys.ts에 추가
shops: {
  ...
  images: (shopId: number) => [...queryKeys.shops.all, "images", shopId] as const,
}

// 새 query 파일
import { queryKeys } from "@/api/queryKeys";

export const useShopImages = (shopId: number) => {
  return useQuery({
    queryKey: queryKeys.shops.images(shopId),
    ...
  });
};
```

## 효과

1. **타입 안전성**: TypeScript 자동완성 및 컴파일 타임 검증
2. **일관성**: 모든 query key가 `["shops", ...]` 형태로 통일
3. **유지보수성**: key 변경 시 한 곳만 수정
4. **캐시 관리 용이**: 계층 구조로 관련 쿼리 일괄 무효화 가능

## 관련 문서

- [TanStack Query - Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- `.ai/coding_standards.md` - React Query 사용 패턴
