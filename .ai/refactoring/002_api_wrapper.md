# Refactoring #002: API Wrapper

> 작성일: 2026-02-04
> 상태: 완료

## 개요

API 호출 시 반복되는 에러 처리 로직을 래퍼 함수로 추출하여 중복 코드를 제거하고 일관된 에러 처리를 보장합니다.

## 배경 및 문제점

### 기존 문제

모든 API 호출 코드에서 동일한 패턴이 반복되고 있었습니다:

```typescript
// 기존 코드 (약 20줄)
export const useShopDetail = (shopId: number) => {
  return useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<ShopDetail>>(`/api/shops/${shopId}`);

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "가게 정보를 불러오는데 실패했어요.");
        }

        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) {
          throw new Error(apiError.message);
        }
        throw error;
      }
    },
  });
};
```

문제점:

- 15개 이상의 query/mutation 파일에서 동일한 try-catch 패턴 반복
- ApiResponse 검증 로직 중복
- extractApiError 호출 중복
- 에러 메시지 처리 방식 불일치 가능성

## 해결 방안

### API Wrapper 패턴 적용

`src/api/request.ts`에 공통 래퍼 함수를 생성하여 반복 로직을 캡슐화:

```typescript
// src/api/request.ts
interface RequestOptions<T> {
  errorMessage?: string; // 기본 에러 메시지
  allowUnauthorized?: boolean; // 401 시 null 반환 (비로그인 허용)
  transform?: (data: T) => T; // 응답 데이터 변환
  params?: Record<string, unknown>; // Query parameters
  headers?: Record<string, unknown>; // 커스텀 헤더
}

// 핵심 래퍼 함수
export async function request<T>(
  method: HttpMethod,
  url: string,
  data?: unknown,
  options?: RequestOptions<T>
): Promise<T> {
  // 공통 로직: try-catch, ApiResponse 검증, 에러 추출
}

// 편의 함수들
export async function get<T>(url, params?, options?): Promise<T>;
export async function post<T>(url, data?, options?): Promise<T>;
export async function put<T>(url, data?, options?): Promise<T>;
export async function patch<T>(url, data?, options?): Promise<T>;
export async function del<T>(url, data?, options?): Promise<T>;
```

## 변경 내역

### 새로 생성된 파일

| 파일                 | 설명               |
| -------------------- | ------------------ |
| `src/api/request.ts` | API 래퍼 함수 모듈 |

### 수정된 Query 파일 (8개)

| 파일                     | 변경 내용                         |
| ------------------------ | --------------------------------- |
| `useShopDetail.ts`       | get 래퍼 적용                     |
| `useFavorites.ts`        | get 래퍼 적용 (allowUnauthorized) |
| `useReviews.ts`          | get 래퍼 적용                     |
| `useInfiniteReviews.ts`  | get 래퍼 적용                     |
| `useUser.ts`             | get 래퍼 적용 (allowUnauthorized) |
| `useMyReports.ts`        | get 래퍼 적용 (allowUnauthorized) |
| `useCheckNearbyShops.ts` | get 래퍼 적용                     |
| `useShopsInBounds.ts`    | get 래퍼 적용                     |

### 수정된 Mutation 파일 (11개)

| 파일                       | 변경 내용                          |
| -------------------------- | ---------------------------------- |
| `useCreateReview.ts`       | post 래퍼 적용                     |
| `useDeleteReview.ts`       | del 래퍼 적용                      |
| `useUpdateReview.ts`       | put 래퍼 적용                      |
| `useToggleFavorite.ts`     | post/del 래퍼 적용                 |
| `useToggleReviewLike.ts`   | post/del 래퍼 적용                 |
| `useUpdateNickname.ts`     | patch 래퍼 적용                    |
| `useUpdateProfileImage.ts` | patch 래퍼 적용                    |
| `useCreateShop.ts`         | post 래퍼 적용 (params 옵션)       |
| `useLogout.ts`             | post 래퍼 적용                     |
| `useWithdraw.ts`           | del 래퍼 적용 (body 지원)          |
| `useUploadFile.ts`         | post 래퍼 적용 (FormData, headers) |

## 사용 가이드

### 기본 사용법

```typescript
import { get, post, put, patch, del } from "@/api/request";

// GET 요청
const data = await get<ShopDetail>("/api/shops/1");

// GET with params
const list = await get<Shop[]>("/api/shops", { page: 1, size: 10 });

// POST 요청
const result = await post<Review>(
  "/api/reviews",
  { content: "좋아요" },
  {
    errorMessage: "리뷰 작성에 실패했어요.",
  }
);

// POST with query params (가게 생성 등)
const shop = await post<Shop>("/api/shops", shopData, {
  params: { latitude: 37.5, longitude: 127.0 },
});

// DELETE with body (회원탈퇴 등)
await del<null>(
  "/api/users/withdraw",
  { reasons: ["이유1"] },
  {
    errorMessage: "회원탈퇴에 실패했어요.",
  }
);

// FormData 업로드
const formData = new FormData();
formData.append("file", file);
const result = await post<FileResponse>("/api/files", formData, {
  params: { folder: "profiles" },
  headers: { "Content-Type": undefined },
});
```

### Query Hook에서 사용

```typescript
// Before (20줄)
export const useShopDetail = (shopId: number) => {
  return useQuery({
    queryKey: queryKeys.shops.detail(shopId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<ShopDetail>>(...);
        if (!data.success || !data.data) throw new Error(...);
        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) throw new Error(apiError.message);
        throw error;
      }
    },
  });
};

// After (8줄)
export const useShopDetail = (shopId: number) => {
  return useQuery({
    queryKey: queryKeys.shops.detail(shopId),
    queryFn: () =>
      get<ShopDetail>(`/api/shops/${shopId}`, undefined, {
        errorMessage: "가게 정보를 불러오는데 실패했어요.",
      }),
  });
};
```

### Mutation Hook에서 사용

```typescript
// Before
export const useCreateReview = (shopId: number) => {
  return useMutation({
    mutationFn: async (request: CreateReviewRequest) => {
      try {
        const { data } = await apiClient.post<ApiResponse<ReviewResponse>>(...);
        if (!data.success || !data.data) throw new Error(...);
        return data.data;
      } catch (error) {
        const apiError = extractApiError(error);
        if (apiError) throw new Error(apiError.message);
        throw error;
      }
    },
  });
};

// After
export const useCreateReview = (shopId: number) => {
  return useMutation({
    mutationFn: (request: CreateReviewRequest) =>
      post<ReviewResponse>(ENDPOINTS.REVIEWS.CREATE(shopId), request, {
        errorMessage: "작성에 실패했어요.",
      }),
  });
};
```

### 비로그인 허용 API

```typescript
// 401 에러 시 null 반환 (에러 throw 대신)
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () =>
      get<User>(ENDPOINTS.USER.ME, undefined, {
        allowUnauthorized: true,
        errorMessage: "사용자 정보를 불러오는데 실패했어요.",
      }),
  });
};
```

## 효과

### 코드 감소

| 항목                 | Before | After | 감소율 |
| -------------------- | ------ | ----- | ------ |
| 평균 queryFn 줄 수   | ~15줄  | ~3줄  | -80%   |
| try-catch 블록       | 15+개  | 1개   | -93%   |
| extractApiError 호출 | 15+개  | 1개   | -93%   |

### 품질 개선

- **일관성**: 모든 API 호출이 동일한 에러 처리 로직 사용
- **유지보수성**: 에러 처리 로직 변경 시 한 곳만 수정
- **가독성**: 비즈니스 로직에만 집중 가능
- **타입 안전성**: 제네릭을 통한 응답 타입 추론

### 확장성

- `params` 옵션: POST/PUT/PATCH/DELETE에서 query params 지원
- `headers` 옵션: FormData 등 커스텀 헤더 지원
- `transform` 옵션: 응답 데이터 변환 지원
- `allowUnauthorized` 옵션: 비로그인 API 지원
