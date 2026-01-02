# 프론트엔드 초기 세팅 가이드

> Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query 스택 기준

## 1. Node 버전

- `.nvmrc`에 Node 버전 명시 → `nvm use`로 적용
- 권장 버전: Node 20.11.0 이상

## 2. Next.js 프로젝트 초기화

```bash
# 현재 폴더에 Next.js 14.2.18 설치
npx create-next-app@14.2.18 .

# 설치 시 옵션 선택:
# ✅ TypeScript: Yes
# ✅ ESLint: Yes
# ✅ Tailwind CSS: Yes
# ✅ src/ directory: Yes
# ✅ App Router: Yes
# ❌ Turbopack: No (안정성 고려)
# ❌ import alias 수정: No (기본 @/* 사용)

# TypeScript와 Tailwind CSS 정확한 버전으로 재설치
npm install -D typescript@5.7.2 tailwindcss@3.4.17
```

## 3. 필수 라이브러리 설치

### 상태 관리 및 데이터 페칭

```bash
npm install zustand@5.0.2 @tanstack/react-query@5.62.8 axios@1.7.9
```

### UI 라이브러리 (Shadcn/ui)

```bash
# Shadcn/ui 초기화
npx shadcn@latest init

# 설치 시 옵션:
# Style: Default
# Base color: Slate
# CSS variables: Yes
```

### Kakao Map SDK

```bash
npm install react-kakao-maps-sdk
```

### 개발 도구

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-import
```

## 4. ESLint/Prettier 설정

### `.prettierrc`

```json
{
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": false,
  "trailingComma": "es5",
  "endOfLine": "auto"
}
```

### `.prettierignore`

```text
node_modules/
.next/
out/
build/
dist/
*.min.js
.env*
```

### `eslint.config.mjs` (Flat Config)

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      import: require("eslint-plugin-import"),
    },
    rules: {
      // Import 순서 규칙
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js 내장 모듈
            "external", // 외부 라이브러리
            "internal", // 절대 경로 (@/)
            ["parent", "sibling"], // 상대 경로
            "index", // index 파일
            "object",
            "type", // TypeScript 타입
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // 기타 규칙
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
```

### Import 순서 예시

```tsx
// 1. React 및 Next.js 핵심
import React, { useState, useEffect } from "react";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useStore } from "zustand";

// 3. 내부 모듈 (절대 경로)
import Button from "@/components/common/Button";
import { useUserStore } from "@/store/userStore";
import { formatDate } from "@/utils/date";

// 4. 상대 경로 모듈
import LocalComponent from "./LocalComponent";

// 5. 타입
import type { User } from "@/types/user";

// 6. 스타일 및 자산
import styles from "./page.module.css";
```

## 5. 프로젝트 폴더 구조

```
GOTCHA-FE/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   ├── globals.css         # 전역 스타일
│   │   ├── (auth)/             # 인증 관련 라우트 그룹
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── shops/              # 매장 관련 라우트
│   │       ├── page.tsx        # 매장 리스트
│   │       └── [id]/           # 매장 상세
│   │           └── page.tsx
│   ├── components/             # 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── features/           # 기능별 컴포넌트
│   │   │   ├── map/
│   │   │   │   ├── KakaoMap.tsx
│   │   │   │   └── MapMarker.tsx
│   │   │   └── shop/
│   │   │       ├── ShopCard.tsx
│   │   │       └── ShopList.tsx
│   │   └── ui/                 # Shadcn/ui 컴포넌트
│   ├── store/                  # Zustand 상태 관리
│   │   ├── userStore.ts        # 사용자 상태
│   │   └── mapStore.ts         # 지도 상태
│   ├── api/                    # API 관련
│   │   ├── client.ts           # Axios 인스턴스
│   │   ├── queries/            # TanStack Query hooks
│   │   │   ├── useShops.ts
│   │   │   └── useAuth.ts
│   │   └── endpoints.ts        # API 엔드포인트 상수
│   ├── types/                  # TypeScript 타입
│   │   ├── shop.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/                  # 유틸리티 함수
│   │   ├── date.ts
│   │   └── validation.ts
│   ├── constants/              # 상수
│   │   └── index.ts
│   └── hooks/                  # 커스텀 훅
│       └── useDebounce.ts
├── public/                     # 정적 파일
│   ├── images/
│   └── favicon.ico
├── .env.local                  # 로컬 환경 변수 (gitignore)
├── .env.example                # 환경 변수 예시
├── .nvmrc                      # Node 버전
├── next.config.js              # Next.js 설정
├── tailwind.config.ts          # Tailwind 설정
├── tsconfig.json               # TypeScript 설정
├── eslint.config.mjs           # ESLint 설정
├── .prettierrc                 # Prettier 설정
└── README.md
```

## 6. 환경 변수 설정

### `.env.example`

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Kakao Map API Key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key_here

# OAuth
NEXT_PUBLIC_KAKAO_OAUTH_CLIENT_ID=your_kakao_oauth_client_id
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
```

### `.env.local` (gitignore 필수)

실제 개발 시 사용할 환경 변수를 `.env.local`에 작성하고, `.gitignore`에 포함되어 있는지 확인

## 7. Next.js 설정

### `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 프록시 설정
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },

  // 이미지 최적화 도메인
  images: {
    domains: ["localhost", "your-s3-bucket.amazonaws.com"],
  },

  // 외부 스크립트 (Kakao Map SDK)
  // 실제 로딩은 app/layout.tsx의 Script 컴포넌트 사용
};

module.exports = nextConfig;
```

## 8. TypeScript 설정

### `tsconfig.json` (경로 별칭 확인)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 9. Tailwind CSS 커스터마이징

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 프로젝트 커스텀 컬러
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        // Shadcn/ui 기본 컬러 (자동 생성)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ... 기타 Shadcn/ui 컬러
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

## 10. Axios 공용 클라이언트

### `src/api/client.ts`

```ts
import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // 쿠키/세션 자동 전송
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      // 토큰 갱신 또는 로그인 페이지로 리다이렉트
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### `src/api/endpoints.ts`

```ts
// API 엔드포인트 상수 관리
export const ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  // 매장
  SHOPS: {
    LIST: "/shops",
    DETAIL: (id: string) => `/shops/${id}`,
    NEARBY: "/shops/nearby",
  },
  // 사용자
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
} as const;
```

## 11. TanStack Query Provider 설정

### `src/app/providers.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### `src/app/layout.tsx` (Provider 적용)

```tsx
import type { Metadata } from "next";
import Script from "next/script";

import Providers from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "GOTCHA! - 가챠샵 지도 서비스",
  description:
    "가챠샵을 지도 기반으로 탐색하고 매장 정보를 확인할 수 있는 모바일 웹 서비스",
  openGraph: {
    title: "GOTCHA! - 가챠샵 지도 서비스",
    description: "가까운 가챠샵을 찾아보세요",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Kakao Map SDK */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 12. Zustand Store 예시

### `src/store/userStore.ts`

```ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoggedIn: false,
        setUser: (user) => set({ user, isLoggedIn: true }),
        logout: () => set({ user: null, isLoggedIn: false }),
      }),
      {
        name: "user-storage", // localStorage 키
      }
    )
  )
);
```

## 13. TanStack Query Hook 예시

### `src/api/queries/useShops.ts`

```ts
import { useQuery } from "@tanstack/react-query";

import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

import type { Shop } from "@/types/shop";

// 매장 리스트 조회
export const useShops = () => {
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data } = await apiClient.get<Shop[]>(ENDPOINTS.SHOPS.LIST);
      return data;
    },
  });
};

// 매장 상세 조회
export const useShop = (id: string) => {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Shop>(ENDPOINTS.SHOPS.DETAIL(id));
      return data;
    },
    enabled: !!id, // id가 있을 때만 실행
  });
};
```

## 14. `.nvmrc` 추가

```text
18.17.0
```

## 15. README 업데이트

기존 README.md에 다음 내용 추가:

````markdown
## 개발 환경 설정

### 필수 요구사항

- Node.js 18.17 이상
- npm 9 이상

### 설치 및 실행

1. Node 버전 설정 (nvm 사용 시)

   ```bash
   nvm use
   ```
````

2. 의존성 설치

   ```bash
   npm install
   ```

3. 환경 변수 설정

   ```bash
   cp .env.example .env.local
   # .env.local 파일을 열어 실제 값 입력
   ```

4. 개발 서버 실행
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000)

### 환경 변수

- `NEXT_PUBLIC_API_BASE_URL`: 백엔드 API 주소
- `NEXT_PUBLIC_KAKAO_MAP_KEY`: 카카오맵 API 키
- `NEXT_PUBLIC_KAKAO_OAUTH_CLIENT_ID`: 카카오 로그인 클라이언트 ID

### 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
```

````

## 16. Git 설정

### `.gitignore` 확인 (Next.js가 자동 생성)

```text
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## 17. 주석 규칙

- **모든 주석은 한국어로 작성**
- 복잡한 로직이나 비즈니스 규칙에만 주석 추가
- 컴포넌트 상단에 간단한 설명 주석 추가

```tsx
/**
 * 매장 카드 컴포넌트
 * 매장 리스트에서 개별 매장 정보를 표시합니다.
 */
export default function ShopCard({ shop }: ShopCardProps) {
  // ... 구현
}
```

## 체크리스트

- [ ] Node 버전 설정 (`.nvmrc`)
- [ ] Next.js 14 프로젝트 생성
- [ ] TypeScript 5.7.2, Tailwind CSS 3.4.17 재설치
- [ ] 필수 라이브러리 설치 (Zustand, TanStack Query, Axios)
- [ ] ESLint/Prettier 설정
- [ ] 폴더 구조 생성
- [ ] 환경 변수 설정 (`.env.example`, `.env.local`)
- [ ] Tailwind CSS 커스터마이징
- [ ] Axios 클라이언트 생성
- [ ] TanStack Query Provider 설정
- [ ] Zustand Store 예시 작성
- [ ] README 업데이트
- [ ] 초기 커밋 및 푸시
