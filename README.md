# GOTCHA! – 가챠샵 지도 서비스

가챠샵(Gacha Shop)을 지도 기반으로 탐색하고, 리스트 및 상세 페이지를 통해 매장 정보를 확인할 수 있는 **모바일 웹 서비스**입니다.

---

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Kakao Map SDK
- Shadcn/ui
- Vercel

### Backend

- Spring Boot 3.x
- Java 21
- Spring Data JPA
- PostgreSQL
- Swagger
- AWS EC2 / S3

---

## 개발 환경 설정

### 필수 요구사항

- Node.js 20.11 이상
- npm 9 이상

### 설치 및 실행

1. Node 버전 설정 (nvm 사용 시)

   ```bash
   nvm use
   ```

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

---

## 프로젝트 폴더 구조

```
GOTCHA-FE/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   ├── providers.tsx       # TanStack Query Provider
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   ├── features/           # 기능별 컴포넌트
│   │   │   ├── map/            # 지도 관련
│   │   │   └── shop/           # 매장 관련
│   │   └── ui/                 # Shadcn/ui 컴포넌트
│   ├── store/                  # Zustand 상태 관리
│   │   └── userStore.ts        # 사용자 상태
│   ├── api/                    # API 관련
│   │   ├── client.ts           # Axios 인스턴스
│   │   ├── endpoints.ts        # API 엔드포인트 상수
│   │   └── queries/            # TanStack Query hooks
│   │       └── useShops.ts
│   ├── types/                  # TypeScript 타입
│   │   ├── shop.ts
│   │   └── user.ts
│   ├── utils/                  # 유틸리티 함수
│   ├── constants/              # 상수
│   ├── hooks/                  # 커스텀 훅
│   └── lib/                    # Shadcn/ui 유틸리티
├── public/                     # 정적 파일
├── .env.local                  # 로컬 환경 변수 (gitignore)
├── .env.example                # 환경 변수 예시
├── .nvmrc                      # Node 버전
├── next.config.mjs             # Next.js 설정
├── tailwind.config.ts          # Tailwind 설정
├── tsconfig.json               # TypeScript 설정
├── eslint.config.mjs           # ESLint 설정
├── .prettierrc                 # Prettier 설정
└── README.md
```

---

## User Flow (v1)

1. 소셜 로그인
2. 메인 페이지 → 가챠샵 지도
3. 지도 핀 클릭 → 매장 미리보기
4. 하단 리스트 슬라이드
5. 매장 상세 페이지 진입

---

## 개발 가이드

### 주석 규칙

- 모든 주석은 한국어로 작성
- 복잡한 로직이나 비즈니스 규칙에만 주석 추가
- 컴포넌트 상단에 간단한 설명 주석 추가

### Import 순서

1. React 및 Next.js 핵심
2. 외부 라이브러리
3. 내부 모듈 (절대 경로 @/)
4. 상대 경로 모듈
5. 타입
6. 스타일 및 자산

자세한 내용은 [ai/initial_setting.md](ai/initial_setting.md)를 참조하세요.
