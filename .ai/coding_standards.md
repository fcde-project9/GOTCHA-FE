# Coding Standards (Frontend)

> **Next.js 16 환경**: 본 프로젝트는 Next.js 16 + React 19를 사용합니다.
> 코드 작성 시 [`.ai/nextjs16_best_practices.md`](./nextjs16_best_practices.md)를 참고하세요.

## 프로젝트 아키텍처 및 패턴 요약

본 프로젝트는 다음 아키텍처 패턴을 따릅니다:

| 영역           | 패턴                     | 설명                                                                       |
| -------------- | ------------------------ | -------------------------------------------------------------------------- |
| **상태 관리**  | Zustand + TanStack Query | 전역 상태(useMapStore, useAuthStore)는 Zustand, 서버 상태는 TanStack Query |
| **API 레이어** | API Wrapper Pattern      | `src/api/request.ts`의 `get/post/del` 함수로 공통 에러 처리                |
| **Query Key**  | Query Key Factory        | `src/api/queryKeys.ts`에서 중앙 관리                                       |
| **에러 처리**  | Error Boundary           | `QueryErrorBoundary`로 React Query 에러 자동 처리                          |
| **인증**       | Zustand Persist          | localStorage 기반 토큰 관리, hydration 대기                                |
| **컴포넌트**   | Feature-based Structure  | `components/features/` 하위에 도메인별 폴더 구조                           |

상세 아키텍처 다이어그램: [`.ai/architecture.md`](./architecture.md)

## 네이밍

- 함수/컴포넌트는 의도를 드러내는 완전한 단어 사용
- 축약 지양, 역할 중심 명명 (ex. `handleSubmit`, `refreshUserFromServer`)
- 타입/인터페이스는 구체적이고 의미 있는 필드명 사용

## TypeScript

- 공개 API/함수 시그니처는 명시적 타입 표기
- `any`/unsafe 캐스팅 지양
- 유틸/도메인 타입은 재사용 고려해 분리

## React / Next.js 16

- 가드클로즈(early return) 선호, 깊은 중첩 지양
- 불필요한 try/catch 금지(의미 있는 처리 시에만)
- 상태/부수효과 최소화, 의존성 배열 엄격 관리
- 조건부 렌더링/로딩 상태는 명확히 표현
- `src/app/` 폴더는 App Router 기반, 각 폴더가 URL 경로에 대응
- components와 utils를 먼저 확인하고 재사용할 수 있는 코드는 재사용하기
- import할때는 최대한 절대경로 ('@') 사용
- useEffect 사용 시 정리(cleanup) 함수 추가와 이벤트 리스너 정리 패턴

### Next.js 16 필수 패턴

- **서버 컴포넌트 기본**: 클라이언트 상태가 필요할 때만 `"use client"` 추가
- **params/searchParams 비동기**: `const { id } = await params;`
- **cookies/headers 비동기**: `const cookieStore = await cookies();`
- **캐싱**: 필요한 컴포넌트에 `"use cache"` + `cacheTag()` 적용
- **데이터 변경**: Server Actions + `revalidateTag()` 사용

### React 19 권장 Hook

- `useFormStatus`: 폼 제출 로딩 상태
- `useActionState`: Server Action 상태 관리
- `use`: Promise/Context 직접 읽기

> **Note**: 낙관적 업데이트는 React 19의 `useOptimistic` 대신 React Query의 `onMutate` 패턴 사용
>
> - 프로젝트가 TanStack Query 기반이라 캐시 일관성 유지에 유리
> - `onError`로 자동 롤백, `onSettled`로 서버 동기화 패턴이 깔끔
> - 캐시 업데이트 시 다른 컴포넌트에서도 즉시 반영됨
>
> (상세 패턴은 아래 "Optimistic Update" 섹션 참고)

## 유틸 함수

- 2개 이상의 컴포넌트에서 사용되는 로직은 `src/utils/`에 공통 함수로 분리
- 유틸 함수는 단일 책임 원칙을 따르며, 명확한 JSDoc 주석 작성
- `src/utils/index.ts`에서 export하여 `@/utils`로 간편하게 import
- 예시: `openContactSupport()` - 문의하기 로직

## 공통 컴포넌트

- 공통 컴포넌트로 많이 사용할법한 컴포넌트 만들기 전에 `@/components/common` 참고하여 재사용할 컴포넌트 있는지 먼저 확인

### Button 사용법

버튼이 필요한 경우 `@/components/common`의 Button 컴포넌트를 사용하세요.

```tsx
import { Button } from "@/components/common";

// 기본 사용
<Button variant="primary">확인</Button>

// Variants: primary(메인액션), secondary(보조), tertiary(취소), ghost(최소)
<Button variant="secondary" size="large">수정</Button>

// Sizes: large(56px), medium(48px), small(40px)
<Button size="small">작은 버튼</Button>

// States: loading, disabled, fullWidth
<Button loading>처리 중...</Button>
<Button disabled>비활성화</Button>
<Button fullWidth>전체 너비</Button>
```

**테스트 페이지**: 개발 서버에서 `/button-test` 접속하여 모든 스타일 확인 가능  
**상세 문서**: `src/components/common/Button.md` 참고

### 아이콘

- 아이콘이 필요한 경우 `lucide-react`을 사용하세요.

## 라우팅/가드

- `ProtectedRoute`, `AdminRoute`는 세션 체크 지연 호출 패턴 유지
- 초기 렌더 리다이렉트 레이스컨디션 방지(loading 초기값 `!user`)
- Outlet 패턴을 사용하되, 필요 시 children 명시

## 데이터/요청

- TanStack Query는 서버 상태에만 사용, 로컬 UI 상태는 useState
- API 응답 타입은 `ApiResponse<T>` 형태 유지
- 에러 코드/메시지는 사용자 메시지와 개발자 로그를 분리

### React Query 사용 패턴

#### 폴더 구조

```
src/api/
├── queries/      # useQuery 훅 (데이터 조회 - GET)
├── mutations/    # useMutation 훅 (데이터 변경 - POST/PUT/DELETE)
├── queryKeys.ts  # Query Key Factory (중앙 관리)
├── request.ts    # API Wrapper (공통 요청 처리)
├── client.ts     # axios 인스턴스
├── endpoints.ts  # API 엔드포인트 상수
└── types.ts      # 공통 타입 정의
```

#### 규칙

1. **queries vs mutations**: GET 요청은 `queries/`, POST/PUT/DELETE는 `mutations/`
2. **네이밍**: `use` 접두사 + 동작 (예: `useShopDetail`, `useCreateReview`)
3. **에러 처리**: `request()` 함수가 자동 처리, 필요시 `extractApiError()` 사용
4. **타입 안전성**: `ApiResponse<T>` 제네릭으로 응답 타입 명시
5. **캐시 무효화**: mutation 성공 시 `invalidateQueries()`로 관련 쿼리 갱신 (상세 패턴은 아래 참고)

#### Query Key Factory (`src/api/queryKeys.ts`)

```typescript
import { queryKeys } from "@/api/queryKeys";

// 사용 예시
useQuery({
  queryKey: queryKeys.shops.detail(shopId),
  queryFn: () => get<ShopDetail>(`/api/shops/${shopId}`),
});

// 무효화
queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
```

#### 캐시 무효화 (Cache Invalidation)

##### invalidateQueries vs staleTime

| 구분   | invalidateQueries   | staleTime                       |
| ------ | ------------------- | ------------------------------- |
| 용도   | 수동 캐시 무효화    | 자동 신선도 관리                |
| 시점   | mutation 성공 후    | 쿼리 정의 시                    |
| 사용처 | 데이터 변경 후 갱신 | 읽기 전용/자주 안 바뀌는 데이터 |

##### Partial Query Key 매칭

쿼리 키에 파라미터(sortBy 등)가 포함된 경우, 부분 키로 무효화해야 모든 관련 쿼리가 갱신됩니다.

```typescript
// ❌ 문제: sortBy가 다른 쿼리는 무효화 안됨
queryClient.invalidateQueries({
  queryKey: queryKeys.shops.detail(shopId, sortBy),
});

// ✅ 권장: 부분 키로 해당 shop의 모든 detail 쿼리 무효화
queryClient.invalidateQueries({
  queryKey: ["shops", "detail", shopId],
});
```

##### Mutation에서 캐시 무효화

데이터 변경(생성/수정/삭제) 후에는 관련 쿼리를 무효화하여 UI를 동기화합니다.

```typescript
// src/api/mutations/useCreateReview.ts
export const useCreateReview = (shopId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) =>
      post<ReviewResponse>(ENDPOINTS.REVIEWS.CREATE(shopId), request),
    onSuccess: () => {
      // 리뷰 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byShop(shopId) });
      // 매장 상세 (리뷰 카운트 등) 무효화 - 부분 키 사용
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
```

#### Optimistic Update (낙관적 업데이트)

좋아요, 찜하기처럼 즉각적인 피드백이 필요한 경우 서버 응답을 기다리지 않고 UI를 먼저 업데이트합니다.

```typescript
export const useToggleReviewLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, isLiked }) => {
      /* API 호출 */
    },

    // 1. 요청 전: 캐시 즉시 업데이트 + 이전 상태 저장
    onMutate: async ({ reviewId, isLiked, shopId }) => {
      await queryClient.cancelQueries({ queryKey: ["shops", "detail", shopId] });

      const previousData = queryClient.getQueriesData({
        queryKey: ["shops", "detail", shopId],
      });

      queryClient.setQueriesData({ queryKey: ["shops", "detail", shopId] }, (old) => ({
        ...old,
        reviews: old.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, isLiked: !isLiked, likeCount: review.likeCount + (isLiked ? -1 : 1) }
            : review
        ),
      }));

      return { previousData };
    },

    // 2. 실패 시: 이전 상태로 롤백
    onError: (_, __, context) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    // 3. 완료 후: 서버 데이터와 동기화
    onSettled: (_, __, { shopId }) => {
      queryClient.invalidateQueries({ queryKey: ["shops", "detail", shopId] });
    },
  });
};
```

##### 언제 Optimistic Update를 사용하나?

| 상황                | 권장 방식                          |
| ------------------- | ---------------------------------- |
| 좋아요/찜하기 토글  | Optimistic Update                  |
| 리뷰 작성/수정/삭제 | invalidateQueries (서버 검증 필요) |
| 목록 정렬 변경      | invalidateQueries                  |
| 사용자 프로필 수정  | invalidateQueries                  |

#### API Wrapper (`src/api/request.ts`)

```typescript
import { get, post, del } from "@/api/request";

// GET 요청
const data = await get<ShopDetail>("/api/shops/1");

// POST 요청
const result = await post<Review>("/api/reviews", { content: "좋아요" });

// 비로그인 허용 (401 시 null 반환)
const user = await get<User | null>("/api/users/me", undefined, {
  allowUnauthorized: true,
});

// 커스텀 에러 메시지
const data = await get<Shop[]>("/api/shops", undefined, {
  errorMessage: "매장 목록을 불러오는데 실패했어요.",
});

// DELETE 요청 (응답 데이터 없는 경우)
await del<null>(
  "/api/users/me",
  { reasons: ["LOW_USAGE"] },
  {
    errorMessage: "회원탈퇴에 실패했어요.",
  }
);
// → API가 { success: true } 만 반환해도 null로 처리됨
```

### API 에러 처리 패턴

#### 타입 정의 (`src/api/types.ts`)

```typescript
import { ApiError, ApiResponse, getErrorMessage, extractApiError } from "@/api/types";

// 백엔드 응답 형식
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError; // { code: string, message: string }
}
```

#### 에러 처리 규칙

1. **백엔드 메시지 우선 사용**: 에러 코드별 메시지를 프론트에서 중복 정의하지 않음
2. **401 에러**: 전역 인터셉터에서 알림 표시 후 /login 리다이렉트
3. **개발자 로그**: `console.error`로 상세 정보 기록
4. **사용자 알림**: Toast 또는 alert로 백엔드 메시지 표시

#### 사용 예시

```typescript
// ✅ 권장: API Wrapper 사용 (자동 에러 처리)
import { get } from "@/api/request";

const fetchData = async () => {
  try {
    const user = await get<UserData>("/api/users/me");
    setUser(user); // 성공 시 바로 데이터 반환
  } catch (error) {
    // request()가 이미 Error로 변환해서 throw
    setToast(error instanceof Error ? error.message : "오류가 발생했습니다.");
  }
};

// ⚠️ 레거시: 직접 apiClient 사용 (특수한 경우만)
import apiClient from "@/api/client";
import { ApiResponse, extractApiError } from "@/api/types";

const fetchDataLegacy = async () => {
  try {
    const response = await apiClient.get<ApiResponse<UserData>>("/api/users/me");

    if (!response.data.success) {
      const errorMessage = response.data.error?.message || "오류가 발생했습니다.";
      setToast(errorMessage);
      return;
    }

    setUser(response.data.data);
  } catch (error) {
    const apiError = extractApiError(error);
    const errorMessage = apiError?.message || "네트워크 오류가 발생했습니다.";
    setToast(errorMessage);
  }
};
```

#### 전역 인터셉터 동작 (`src/api/client.ts`)

- **401 에러 발생 시**:
  1. 로그인 관련 페이지(/login, /oauth/callback)에서는 무시
  2. 그 외 페이지에서는 토큰 삭제 → 알림 표시 → /login 리다이렉트
- **Private Browsing 대응**: localStorage 접근 시 try-catch로 감싸기

## 스타일/포맷

- 기존 포맷을 최대한 유지
- 라인 길이 과도 시 가독성을 최우선으로 개행
- 불필요한 주석/로그 삭제, 핵심 맥락만 주석
- CSS는 `tailwind.config.ts`에 정의된 디자인 시스템 변수 우선 사용
- inline style 대신 Tailwind className 사용
  - `env(safe-area-inset-bottom)` 등 CSS 환경 변수도 Tailwind arbitrary value로 처리: `pb-[calc(env(safe-area-inset-bottom)+24px)]` (공백 없이)
  - 배경색: `bg-default`, `bg-white`, `bg-grey` (GOTCHA 시스템)
  - 메인 컬러: `bg-main-500`, `text-main-700`
  - Grey 컬러: `bg-grey-900`, `text-grey-800`
  - Line 컬러: `border-line-100`, `border-line-300`
- 컬러/간격 등 반복 스타일은 `tailwind.config.ts`에 먼저 정의 후 활용
- `!important` 사용 금지

## 모달 (Modal) 표준

### 모달 동작 요구사항

#### 1. Focus Trap (포커스 트랩)

- 모달이 열리면 포커스가 모달 내부로 이동
- Tab/Shift+Tab으로 모달 내부 요소만 순환
- 모달 외부 요소는 포커스 불가
- 첫 번째 포커스 가능한 요소에 자동 포커스 (일반적으로 닫기 버튼 또는 주요 액션 버튼)

#### 2. Overlay/Backdrop 상호작용

- 오버레이 클릭 시 모달 닫기 (dismissible modal)
- 중요한 액션(결제, 삭제 등)은 오버레이 클릭으로 닫히지 않도록 설정 가능
- 오버레이 배경색: `bg-black/50` (50% 투명도)
- z-index: `z-50` (모달), `z-40` (오버레이)

#### 3. 접근성 (Accessibility)

- ESC 키로 모달 닫기 지원
- `role="dialog"` 또는 `role="alertdialog"` 속성
- `aria-labelledby` (제목 ID 참조)
- `aria-describedby` (설명 ID 참조, 선택사항)
- 닫기 버튼에 `aria-label="닫기"` 추가
- 모달이 열리면 body 스크롤 방지

#### 4. 애니메이션

- 페이드 인/아웃: `transition-opacity duration-200`
- 슬라이드 업(바텀시트): `transition-transform duration-300`
- 모달이 닫힐 때 애니메이션 완료 후 DOM에서 제거

### 모달 구현 체크리스트

```typescript
// ✅ 필수 구현 사항
interface ModalProps {
  isOpen: boolean;              // 모달 열림 상태
  onClose: () => void;          // 닫기 핸들러
  title?: string;               // 접근성을 위한 제목
  dismissible?: boolean;        // 오버레이 클릭으로 닫기 가능 여부 (기본: true)
}

// ✅ 구현 예시
export function ExampleModal({ isOpen, onClose, title, dismissible = true }: ModalProps) {
  // ESC 키 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <div
        role="dialog"
        aria-labelledby={title ? "modal-title" : undefined}
        className="relative z-10 mx-5 w-full max-w-[340px] rounded-2xl bg-white p-6"
      >
        {/* 닫기 버튼 */}
        <button onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>

        {/* 컨텐츠 */}
        {title && <h2 id="modal-title">{title}</h2>}
        {/* ... */}
      </div>
    </div>
  );
}
```

## 권한 요청 (Permission Request) 가이드라인

### 표준화된 메시지 (Standardized Copy)

#### 위치 권한 (Location Permission)

```typescript
// ✅ 권장 메시지
const LOCATION_PERMISSION_MESSAGES = {
  title: "위치 권한이 필요해요",
  description: "내 주변 매장을 찾기 위해\n위치 권한이 필요합니다.",
  primaryAction: "위치 권한 허용하기",
  secondaryAction: "나중에",
  deniedTitle: "📍 설정 방법",
  deniedDescription: "브라우저 설정에서 위치 권한을 허용해주세요.",
};

// ❌ 피해야 할 표현
// - "위치 정보를 수집합니다" (불안감 유발)
// - "필수입니다" (강제성)
// - 기술 용어 (Geolocation API, GPS 등)
```

#### 알림 권한 (Notification Permission)

```typescript
const NOTIFICATION_PERMISSION_MESSAGES = {
  title: "알림을 받아보세요",
  description: "새로운 매장 정보와 이벤트 소식을\n가장 먼저 받아보세요.",
  primaryAction: "알림 받기",
  secondaryAction: "나중에",
};
```

## 에러 바운더리 (Error Boundary)

### 컴포넌트 종류

```
src/components/common/
├── ErrorBoundary.tsx         # 기본 에러 바운더리
└── QueryErrorBoundary.tsx    # React Query 연동 에러 바운더리
```

### 사용 예시

```typescript
import { QueryErrorBoundary } from "@/components/common";

// 기본 사용
<QueryErrorBoundary>
  <MyQueryComponent />
</QueryErrorBoundary>

// 커스텀 fallback
<QueryErrorBoundary
  fallback={(error, reset) => (
    <ErrorCard error={error} onRetry={reset} />
  )}
>
  <MyQueryComponent />
</QueryErrorBoundary>
```

### throwOnError 사용 시 주의사항

```typescript
// ✅ 타입 가드 필수
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  throwOnError: (error) => error instanceof Error && "status" in error && error.status >= 500,
});
```

## 테스트/품질

- 타입/린트 에러 0 유지
- 위험 구간(인증/가드/리다이렉트)은 수동 테스트 체크리스트 운영
