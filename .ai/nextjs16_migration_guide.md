# Next.js 16 마이그레이션 가이드

> 작성일: 2026-01-31
> 현재 버전: Next.js 14.2.18 → 목표 버전: Next.js 16.x

---

## 목차

1. [Next.js 16 개요](#1-nextjs-16-개요)
2. [마이그레이션 필요성](#2-마이그레이션-필요성)
3. [사전 요구사항](#3-사전-요구사항)
4. [마이그레이션 체크리스트](#4-마이그레이션-체크리스트)
5. [상세 마이그레이션 가이드](#5-상세-마이그레이션-가이드)
6. [테스트 및 검증](#6-테스트-및-검증)
7. [롤백 계획](#7-롤백-계획)
8. [후속 작업 (TODO)](#8-후속-작업-todo)

---

## 1. Next.js 16 개요

### 1.1 릴리스 정보

- **릴리스 날짜**: 2025년 10월 21일
- **최신 안정 버전**: 16.1 (2025년 12월 18일)

Next.js 16은 Turbopack, 캐싱, 라우팅, 개발자 도구에 대한 주요 업그레이드를 포함한 메이저 릴리스입니다.

### 1.2 주요 신규 기능

| 기능                     | 설명                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Turbopack (Stable)**   | 기본 번들러로 채택. Fast Refresh 5-10배, 빌드 속도 2-5배 향상                     |
| **Cache Components**     | `use cache` 디렉티브를 활용한 새로운 캐싱 모델. Partial Pre-Rendering(PPR)과 통합 |
| **Proxy (`proxy.ts`)**   | 기존 Middleware를 대체. 네트워크 경계를 더 명확하게 구분                          |
| **Next.js Devtools MCP** | Model Context Protocol 통합으로 AI 기반 디버깅 지원                               |
| **Async Request APIs**   | `params`, `searchParams`, `cookies()`, `headers()` 등 비동기 처리 필수화          |

### 1.3 Breaking Changes 요약

| 제거/변경된 기능              | 대체 방법                                 |
| ----------------------------- | ----------------------------------------- |
| AMP 지원                      | 제거됨 (필요시 별도 구현)                 |
| `next lint` 명령어            | ESLint 또는 Biome 직접 사용               |
| `middleware.ts`               | `proxy.ts`로 변경                         |
| 동기 `params`, `searchParams` | `await params`, `await searchParams` 사용 |
| 동기 `cookies()`, `headers()` | `await cookies()`, `await headers()` 사용 |
| Node.js 18                    | 지원 중단 (Node.js 20.9+ 필수)            |
| `experimental.turbopack`      | `turbopack`으로 상단 이동                 |

### 1.4 Next.js 16.1 추가 개선사항

- 설치 용량 **20MB 감소** (Turbopack 파일 시스템 캐싱 레이어 단순화)
- 강력한 하위 호환성 유지 (강제 마이그레이션 없음)
- 보안 패치 (CVE-2025-55182 & CVE-2025-66478)

---

## 2. 마이그레이션 필요성

### 2.1 왜 업그레이드해야 하는가?

#### 성능 향상

| 항목         | 개선 효과        |
| ------------ | ---------------- |
| Fast Refresh | 5-10배 빠름      |
| 빌드 속도    | 2-5배 빠름       |
| 설치 용량    | 20MB 감소 (16.1) |

Turbopack이 기본 번들러로 채택되면서 **개발 경험(DX)이 크게 향상**됩니다. 특히 대규모 프로젝트에서 Hot Module Replacement(HMR) 속도가 눈에 띄게 빨라집니다.

#### 보안

Next.js 16.1에서 RSC "Flight" 프로토콜 관련 **보안 취약점이 패치**되었습니다:

- CVE-2025-55182
- CVE-2025-66478

장기적으로 보안 패치를 받으려면 최신 메이저 버전으로 업그레이드가 필요합니다.

#### 장기 지원 (LTS)

- Next.js 14는 점차 유지보수 모드로 전환
- 새로운 기능 및 최적화는 Next.js 16+에서만 제공
- React 19 등 향후 생태계 업데이트와의 호환성 확보

#### 새로운 캐싱 모델

`use cache` 디렉티브와 Cache Components를 통해:

- 더 세밀한 캐싱 제어
- 즉각적인 네비게이션 경험
- 서버/클라이언트 데이터 동기화 개선

### 2.2 업그레이드하지 않으면?

| 리스크            | 설명                                              |
| ----------------- | ------------------------------------------------- |
| **보안 취약점**   | 향후 보안 패치 미적용                             |
| **생태계 호환성** | React 19, 신규 라이브러리와 호환성 문제 발생 가능 |
| **기술 부채**     | 버전 격차가 커질수록 마이그레이션 비용 증가       |
| **성능 저하**     | Turbopack 등 최신 최적화 미적용                   |

### 2.3 현재 프로젝트 영향도 분석

| 항목                         | 영향도 | 작업량                     |
| ---------------------------- | ------ | -------------------------- |
| `middleware.ts` → `proxy.ts` | 높음   | 낮음 (파일명 및 함수 변경) |
| `params` 비동기화            | 높음   | 낮음 (1개 파일)            |
| `next lint` 제거             | 중간   | 낮음 (스크립트 변경)       |
| 의존성 업데이트              | 낮음   | 낮음 (자동화 가능)         |
| Node.js 업그레이드           | 중간   | 환경에 따라 다름           |

**결론**: 본 프로젝트는 Breaking Changes 영향이 제한적이며, 마이그레이션 작업량이 적습니다. 성능 및 보안 이점을 고려할 때 업그레이드를 권장합니다.

---

## 3. 사전 요구사항

### 3.1 Node.js 버전 업그레이드

Next.js 16은 Node.js 18 지원을 중단했습니다.

| 요구사항 | 버전        |
| -------- | ----------- |
| Node.js  | 20.9+ (LTS) |
| npm      | 10+         |

```bash
# Node.js 버전 확인
node -v

# nvm 사용 시 업그레이드
nvm install 20

# .nvmrc 에 버전 명시 후
nvm use 20
```

---

## 4. 마이그레이션 체크리스트

### 필수 작업

- [ ] Node.js 20.9+ 설치 확인
- [ ] 의존성 업데이트 (`next`, `react`, `react-dom`, `eslint-config-next`)
- [ ] `middleware.ts` → `proxy.ts` 파일명 및 코드 변경
- [ ] `params` 비동기 접근으로 변경 (`src/app/shop/[id]/layout.tsx`)
- [ ] `next lint` → `eslint` 직접 실행으로 변경
- [ ] 빌드 테스트 (`npm run build`)
- [ ] 개발 서버 테스트 (`npm run dev`)
- [ ] 주요 페이지 동작 확인

### 선택 작업 (권장)

- [ ] Turbopack 활성화 여부 결정
- [ ] 로컬 이미지 설정 확인 (`images.dangerouslyAllowLocalIP`)
- [ ] Cache Components 기능 검토

---

## 5. 상세 마이그레이션 가이드

### 5.1 의존성 업데이트

#### 자동 업그레이드 (권장)

```bash
npx @next/codemod@canary upgrade latest
```

#### 수동 업그레이드

```bash
# 핵심 패키지 업데이트
npm install next@latest react@latest react-dom@latest

# ESLint 설정 업데이트
npm install -D eslint-config-next@latest
```

**package.json 변경 예상:**

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "eslint-config-next": "^16.0.0"
  }
}
```

---

### 5.2 middleware.ts → proxy.ts 마이그레이션

#### 파일 위치

- 변경 전: `src/middleware.ts`
- 변경 후: `src/proxy.ts`

#### 변경 전 코드

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url, { status: 308 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|sitemap.xml|robots.txt).*)",
  ],
};
```

#### 변경 후 코드

```typescript
// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url, { status: 308 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|sitemap.xml|robots.txt).*)",
  ],
};
```

#### 주요 변경점

1. 파일명: `middleware.ts` → `proxy.ts`
2. 함수: `export function middleware` → `export default function proxy`

---

### 5.3 params 비동기 접근 마이그레이션

#### 파일 위치

- `src/app/shop/[id]/layout.tsx`

#### 타입 정의 변경

```typescript
// 변경 전
interface ShopLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

// 변경 후
interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}
```

#### generateMetadata 함수 변경

```typescript
// 변경 전 (line 125-126)
export async function generateMetadata({ params }: ShopLayoutProps): Promise<Metadata> {
  const shopId = parseInt(params.id, 10);
  // ...
}

// 변경 후
export async function generateMetadata({ params }: ShopLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const shopId = parseInt(id, 10);
  // ...
}
```

#### ShopLayout 컴포넌트 변경

```typescript
// 변경 전 (line 161-162)
export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const shopId = parseInt(params.id, 10);
  // ...
}

// 변경 후
export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { id } = await params;
  const shopId = parseInt(id, 10);
  // ...
}
```

---

### 5.4 next lint → ESLint 직접 실행 마이그레이션

#### 자동 마이그레이션 (권장)

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

#### 수동 마이그레이션

**package.json 변경:**

```json
{
  "scripts": {
    // 변경 전
    "lint": "next lint",
    "lint:fix": "next lint --fix",

    // 변경 후
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

**lint-staged 설정 변경 (필요시):**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

### 5.5 next.config.mjs 업데이트 (선택)

#### Turbopack 관련 설정

Next.js 16에서는 Turbopack이 기본 번들러입니다. webpack을 계속 사용하려면:

```bash
# webpack 사용 시
next build --webpack
next dev --webpack
```

#### 이미지 로컬 IP 설정 (개발 환경)

현재 `localhost` 이미지 패턴이 있으므로, 필요시 설정 추가:

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gotcha-prod-files.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // Next.js 16에서 로컬 IP 허용 (개발 환경용)
    dangerouslyAllowLocalIP: true,
  },
};
```

---

## 6. 테스트 및 검증

### 6.1 빌드 테스트

```bash
# 빌드 실행
npm run build

# 빌드 성공 확인 후 프로덕션 모드 테스트
npm run start
```

### 6.2 개발 서버 테스트

```bash
npm run dev
```

### 6.3 주요 페이지 동작 확인

| 페이지             | 확인 항목                       |
| ------------------ | ------------------------------- |
| `/` → `/home`      | 리다이렉트 정상 동작 (proxy.ts) |
| `/shop/[id]`       | 메타데이터 생성, JSON-LD 정상   |
| `/oauth/callback`  | 로그인 콜백 정상 동작           |
| `/report`          | 제보 페이지 정상 동작           |
| `/report/register` | 업체 등록 정상 동작             |

### 6.4 Lint 테스트

```bash
npm run lint
npm run lint:fix
```

---

## 7. 롤백 계획

마이그레이션 실패 시 롤백 절차:

```bash
# 1. 브랜치 되돌리기
git checkout dev
git branch -D feat/nextjs-16-migration

# 2. node_modules 재설치 (필요시)
rm -rf node_modules package-lock.json
npm install

# 3. 빌드 확인
npm run build
```

---

## 8. 후속 작업 (TODO)

### 8.1 React 19 린트 규칙 대응

마이그레이션 후 React 19의 새로운 엄격한 린트 규칙이 활성화됩니다. 현재 `warn`으로 설정되어 있으며, 추후 코드 수정이 필요합니다.

#### `react-hooks/set-state-in-effect` 경고

**문제**: `useEffect` 내에서 동기적으로 `setState`를 호출하면 불필요한 리렌더링(cascading render) 발생

**영향받는 파일**:

- `src/app/home/page.tsx` (line 86, 99)

**현재 코드**:

```tsx
useEffect(() => {
  const splashShown = sessionStorage.getItem("splashShown") === "true";
  setShowSplash(!splashShown); // ⚠️ 경고 발생
}, []);
```

**권장 해결 방법**:

1. 초기값을 직접 계산 (lazy initial state)
2. `useSyncExternalStore` 사용 (외부 스토어 동기화)
3. 서버 컴포넌트로 이동

**ESLint 설정** (`eslint.config.mjs`):

```javascript
rules: {
  "react-hooks/set-state-in-effect": "warn",  // TODO: 코드 수정 후 "error"로 변경
}
```

---

## 참고 자료

- [Next.js 16 공식 블로그](https://nextjs.org/blog/next-16)
- [Next.js 16.1 릴리스 노트](https://nextjs.org/blog/next-16-1)
- [Next.js 업그레이드 가이드](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)

---

## 변경 이력

| 날짜       | 버전 | 내용      |
| ---------- | ---- | --------- |
| 2026-01-31 | 1.0  | 최초 작성 |
