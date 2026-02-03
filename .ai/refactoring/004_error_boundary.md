# Refactoring #004: Error Boundary

> 작성일: 2026-02-04
> 상태: 완료

## 개요

React Error Boundary와 React Query 통합 컴포넌트를 추가하여 에러 처리 인프라를 구축합니다.

## 배경 및 문제점

### 기존 상황

- Error Boundary 컴포넌트 부재
- 각 페이지에서 개별적으로 에러 상태 처리
- 예기치 못한 에러 발생 시 앱 크래시 가능성

### 기존 에러 처리 패턴

```typescript
// 페이지별 수동 에러 처리
const { data, isLoading, error } = useQuery(...);

if (error) {
  return <div>에러 발생: {error.message}</div>;
}
```

## 해결 방안

### Error Boundary 인프라 구축

1. **ErrorBoundary** - 기본 React Error Boundary
2. **QueryErrorBoundary** - React Query 통합 Error Boundary
3. **Fallback 컴포넌트** - 에러 UI 컴포넌트들

## 변경 내역

### 새로 생성된 파일

| 파일                                           | 설명                              |
| ---------------------------------------------- | --------------------------------- |
| `src/components/common/ErrorBoundary.tsx`      | 기본 Error Boundary + Fallback UI |
| `src/components/common/QueryErrorBoundary.tsx` | React Query 통합 Error Boundary   |

### 수정된 파일

| 파일                             | 변경 내용                           |
| -------------------------------- | ----------------------------------- |
| `src/components/common/index.ts` | Error Boundary 컴포넌트 export 추가 |

## 컴포넌트 설명

### 1. ErrorBoundary

React 클래스 컴포넌트 기반의 에러 경계:

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

### 2. QueryErrorBoundary

React Query의 `useQueryErrorResetBoundary`와 통합:

```typescript
interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error) => void;
}
```

### 3. Fallback 컴포넌트

| 컴포넌트                    | 용도                       |
| --------------------------- | -------------------------- |
| `DefaultErrorFallback`      | 기본 에러 UI (페이지/섹션) |
| `InlineErrorFallback`       | 인라인 에러 UI (작은 영역) |
| `QueryPageErrorFallback`    | 쿼리 에러 페이지 전체      |
| `QuerySectionErrorFallback` | 쿼리 에러 섹션 영역        |

## 사용 가이드

### 기본 Error Boundary

```tsx
import { ErrorBoundary } from "@/components/common";

// 기본 사용 (자동 fallback)
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// 커스텀 fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <MyComponent />
</ErrorBoundary>

// 함수형 fallback (에러 정보 + reset 함수)
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>에러: {error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>

// 에러 로깅
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Sentry, LogRocket 등으로 전송
    console.error(error, errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### Query Error Boundary

React Query와 함께 사용할 때 쿼리도 자동으로 리셋됩니다:

```tsx
import { QueryErrorBoundary } from "@/components/common";

// 기본 사용
<QueryErrorBoundary>
  <ShopDetailContent />
</QueryErrorBoundary>

// 커스텀 fallback
<QueryErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>데이터 로드 실패</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
>
  <ShopDetailContent />
</QueryErrorBoundary>
```

### throwOnError와 함께 사용

React Query에서 에러를 Error Boundary로 전파하려면:

```tsx
// useQuery에서
const { data } = useQuery({
  queryKey: ["shop", id],
  queryFn: fetchShop,
  throwOnError: true, // 에러를 Error Boundary로 전파
});

// 또는 QueryClient 기본 옵션에서
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        // 특정 에러만 throw (타입 가드 필요)
        if (error instanceof Error && "status" in error) {
          return (error as Error & { status: number }).status >= 500;
        }
        return false;
      },
    },
  },
});
```

### Fallback 컴포넌트 직접 사용

```tsx
import {
  DefaultErrorFallback,
  InlineErrorFallback,
  QueryPageErrorFallback,
  QuerySectionErrorFallback,
} from "@/components/common";

// 페이지 전체 에러
<DefaultErrorFallback
  error={error}
  onRetry={refetch}
  title="문제가 발생했어요"
  description="잠시 후 다시 시도해주세요."
/>

// 인라인 에러 (리스트 아이템 등)
<InlineErrorFallback
  error={error}
  onRetry={refetch}
/>

// 쿼리 에러 페이지
<QueryPageErrorFallback
  title="페이지를 불러올 수 없어요"
  description="네트워크 연결을 확인해주세요."
/>

// 쿼리 에러 섹션
<QuerySectionErrorFallback
  title="리뷰를 불러올 수 없어요"
/>
```

## 적용 권장 사항

### 1. 전역 Error Boundary (권장)

`src/app/layout.tsx` 또는 `providers.tsx`에 추가:

```tsx
// providers.tsx
<QueryClientProvider client={queryClient}>
  <ErrorBoundary
    onError={(error) => {
      // 에러 로깅 서비스로 전송
    }}
  >
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  </ErrorBoundary>
</QueryClientProvider>
```

### 2. 페이지별 Query Error Boundary (선택)

중요 페이지에 적용:

```tsx
// 페이지 레이아웃에 적용
export default function ShopLayout({ children }) {
  return (
    <QueryErrorBoundary
      fallback={(error, reset) => <ShopErrorPage error={error} onRetry={reset} />}
    >
      {children}
    </QueryErrorBoundary>
  );
}
```

### 3. 섹션별 Error Boundary (선택)

독립적인 섹션에 적용:

```tsx
// 리뷰 섹션만 에러 처리
<QueryErrorBoundary fallback={<QuerySectionErrorFallback />}>
  <ReviewSection />
</QueryErrorBoundary>
```

## 효과

### 안정성 향상

- 예기치 못한 에러 발생 시 앱 전체 크래시 방지
- 사용자에게 친절한 에러 메시지 표시
- 에러 복구 기능 (다시 시도) 제공

### 개발 편의성

- 선언적 에러 처리 가능
- React Query와 자연스러운 통합
- 재사용 가능한 에러 UI 컴포넌트

## 향후 개선 사항

1. **에러 로깅 통합**: Sentry 등 에러 모니터링 서비스 연동
2. **에러 타입별 분기**: 네트워크 에러, 인증 에러 등 구분 처리
3. **전역 적용**: providers.tsx에 기본 Error Boundary 추가
