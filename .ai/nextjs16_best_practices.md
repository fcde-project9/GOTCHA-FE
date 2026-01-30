# Next.js 16 Best Practices

> Next.js 16 + React 19 환경에서 코드를 작성하는 모범 사례

---

## 목차

1. [Cache Components (`use cache`)](#1-cache-components-use-cache)
2. [Async Request APIs](#2-async-request-apis)
3. [React 19 새 기능](#3-react-19-새-기능)
4. [Server Actions 개선](#4-server-actions-개선)
5. [Proxy (구 Middleware)](#5-proxy-구-middleware)
6. [Turbopack 최적화](#6-turbopack-최적화)
7. [이미지 최적화](#7-이미지-최적화)

---

## 1. Cache Components (`use cache`)

Next.js 16의 핵심 기능. 컴포넌트/함수 단위로 캐싱을 명시적으로 제어합니다.

### 1.1 설정 활성화

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    cacheLife: {
      // 커스텀 캐시 프로필 정의
      shop: {
        stale: 60, // 60초 동안 stale 데이터 허용
        revalidate: 300, // 5분마다 재검증
        expire: 3600, // 1시간 후 만료
      },
      review: {
        stale: 30,
        revalidate: 60,
        expire: 600,
      },
    },
  },
};
```

### 1.2 컴포넌트 캐싱

```tsx
// 전체 컴포넌트 캐싱
async function ShopList() {
  "use cache";

  const shops = await fetchShops();
  return (
    <div>
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}

// 캐시 프로필 지정
async function ShopDetail({ id }: { id: number }) {
  "use cache";
  cacheLife("shop"); // 위에서 정의한 shop 프로필 사용

  const shop = await fetchShopDetail(id);
  return <div>{shop.name}</div>;
}
```

### 1.3 함수 단위 캐싱

```tsx
// 데이터 fetching 함수에 캐시 적용
async function getShopData(shopId: number) {
  "use cache";
  cacheTag(`shop-${shopId}`); // 태그 기반 무효화용

  const response = await fetch(`/api/shops/${shopId}`);
  return response.json();
}

// Server Action에서 캐시 무효화
("use server");
import { revalidateTag } from "next/cache";

export async function updateShop(shopId: number, data: ShopData) {
  await db.shops.update(shopId, data);
  revalidateTag(`shop-${shopId}`); // 해당 태그의 캐시 무효화
}
```

### 1.4 캐시 vs 비캐시 조합

```tsx
// 캐시되는 정적 부분
async function ShopHeader({ id }: { id: number }) {
  "use cache";
  const shop = await getShopData(id);
  return <h1>{shop.name}</h1>;
}

// 캐시되지 않는 동적 부분
async function ShopReviews({ id }: { id: number }) {
  // "use cache" 없음 - 항상 최신 데이터
  const reviews = await getLatestReviews(id);
  return <ReviewList reviews={reviews} />;
}

// 조합
export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <ShopHeader id={Number(id)} /> {/* 캐시됨 */}
      <ShopReviews id={Number(id)} /> {/* 항상 최신 */}
    </>
  );
}
```

---

## 2. Async Request APIs

Next.js 16에서 모든 Request API는 비동기입니다.

### 2.1 params, searchParams

```tsx
// ❌ 이전 방식 (Next.js 14)
export default function Page({ params, searchParams }) {
  const id = params.id;
  const query = searchParams.q;
}

// ✅ Next.js 16 방식
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
}
```

### 2.2 cookies, headers

```tsx
// ❌ 이전 방식
import { cookies, headers } from "next/headers";

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
}

// ✅ Next.js 16 방식
import { cookies, headers } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
}
```

### 2.3 generateMetadata에서 params 사용

```tsx
// ✅ Next.js 16 방식
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const shop = await getShopData(Number(id));

  return {
    title: shop.name,
    description: shop.description,
  };
}
```

---

## 3. React 19 새 기능

Next.js 16은 React 19와 함께 제공됩니다.

### 3.1 `use` Hook

Promise나 Context를 직접 읽을 수 있는 새로운 Hook입니다.

```tsx
"use client";
import { use } from "react";

// Promise 직접 사용
function ShopInfo({ shopPromise }: { shopPromise: Promise<Shop> }) {
  const shop = use(shopPromise); // Suspense와 함께 동작
  return <div>{shop.name}</div>;
}

// Context 직접 사용 (조건부 가능!)
function ConditionalTheme({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext); // 조건부로 Context 사용 가능
    return <div style={{ color: theme.primary }}>Themed</div>;
  }
  return <div>No theme</div>;
}
```

### 3.2 `useOptimistic`

낙관적 업데이트를 쉽게 구현합니다.

```tsx
"use client";
import { useOptimistic } from "react";
import { toggleFavorite } from "@/actions/favorite";

function FavoriteButton({ shopId, isFavorite }: { shopId: number; isFavorite: boolean }) {
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite);

  async function handleClick() {
    setOptimisticFavorite(!optimisticFavorite); // 즉시 UI 업데이트
    await toggleFavorite(shopId); // 서버 요청
  }

  return <button onClick={handleClick}>{optimisticFavorite ? "❤️" : "🤍"}</button>;
}
```

### 3.3 `useFormStatus`

폼 제출 상태를 쉽게 추적합니다.

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "제출 중..." : "제출"}
    </button>
  );
}

function ReviewForm({ shopId }: { shopId: number }) {
  async function submitReview(formData: FormData) {
    "use server";
    await createReview(shopId, formData);
  }

  return (
    <form action={submitReview}>
      <textarea name="content" required />
      <SubmitButton />
    </form>
  );
}
```

### 3.4 `useActionState`

Server Action 상태 관리를 단순화합니다.

```tsx
"use client";
import { useActionState } from "react";
import { createShop } from "@/actions/shop";

function CreateShopForm() {
  const [state, formAction, isPending] = useActionState(createShop, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      <button disabled={isPending}>{isPending ? "생성 중..." : "가게 등록"}</button>
    </form>
  );
}
```

---

## 4. Server Actions 개선

### 4.1 기본 패턴

```tsx
// actions/shop.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function createShop(formData: FormData) {
  const name = formData.get("name") as string;

  try {
    const shop = await db.shops.create({ name });
    revalidatePath("/home"); // 경로 기반 무효화
    return { success: true, shop };
  } catch (error) {
    return { success: false, error: "가게 생성 실패" };
  }
}

export async function deleteShop(shopId: number) {
  await db.shops.delete(shopId);
  revalidateTag("shops"); // 태그 기반 무효화
}
```

### 4.2 폼에서 사용

```tsx
// 방법 1: form action 직접 사용
<form action={createShop}>
  <input name="name" />
  <button type="submit">생성</button>
</form>;

// 방법 2: 클라이언트에서 호출
("use client");
import { createShop } from "@/actions/shop";

function CreateButton() {
  async function handleClick() {
    const result = await createShop(new FormData());
    if (result.success) {
      toast.success("생성 완료!");
    }
  }

  return <button onClick={handleClick}>생성</button>;
}
```

---

## 5. Proxy (구 Middleware)

### 5.1 기본 구조

```typescript
// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증 체크
  const token = request.cookies.get("token");
  if (pathname.startsWith("/mypage") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 리다이렉트
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 5.2 헤더 조작

```typescript
export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 응답 헤더 추가
  response.headers.set("x-custom-header", "value");

  // 요청 헤더 전달
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-forwarded-host", request.headers.get("host") || "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

---

## 6. Turbopack 최적화

Next.js 16에서 Turbopack이 기본 번들러입니다.

### 6.1 개발 환경

```bash
# Turbopack 사용 (기본값)
npm run dev

# webpack 사용 (필요시)
npm run dev -- --webpack
```

### 6.2 빌드

```bash
# Turbopack 빌드 (기본값)
npm run build

# webpack 빌드 (필요시)
npm run build -- --webpack
```

### 6.3 성능 최적화 팁

```tsx
// 동적 임포트로 코드 스플리팅
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
});

// 이미지 최적화
import Image from "next/image";

function ShopImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // 블러 플레이스홀더
    />
  );
}
```

---

## 7. 이미지 최적화

### 7.1 Next.js Image 컴포넌트

```tsx
import Image from "next/image";

// 외부 이미지
<Image
  src="https://example.com/image.jpg"
  alt="설명"
  width={800}
  height={600}
  priority // LCP 이미지에 사용
/>

// 반응형 이미지
<Image
  src="/hero.jpg"
  alt="히어로"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  style={{ objectFit: "cover" }}
/>
```

### 7.2 next.config.mjs 설정

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gotcha-prod-files.s3.ap-northeast-2.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"], // 최신 포맷 우선
    deviceSizes: [640, 750, 828, 1080, 1200], // 반응형 크기
    minimumCacheTTL: 60 * 60 * 24, // 24시간 캐시
  },
};
```

---

## 요약: Next.js 16 체크리스트

### 새 컴포넌트 작성 시

- [ ] 서버 컴포넌트가 기본, 필요시에만 `"use client"` 추가
- [ ] `params`, `searchParams`는 `await`로 접근
- [ ] 캐싱이 필요한 컴포넌트에 `"use cache"` 적용
- [ ] Server Actions로 데이터 변경 처리

### 데이터 fetching 시

- [ ] 서버 컴포넌트에서 직접 fetch (클라이언트 불필요)
- [ ] `"use cache"` + `cacheTag()`로 세밀한 캐시 제어
- [ ] `revalidateTag()`로 필요한 데이터만 무효화

### 폼 처리 시

- [ ] Server Actions 사용
- [ ] `useFormStatus`로 로딩 상태 표시
- [ ] `useOptimistic`으로 즉각적인 UI 반응
- [ ] `useActionState`로 에러/성공 상태 관리

---

## 참고 자료

- [Next.js 16 공식 문서](https://nextjs.org/docs)
- [React 19 새 기능](https://react.dev/blog/2024/12/05/react-19)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
