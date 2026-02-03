# GOTCHA! – 가챠샵 지도 서비스

![GOTCHA! OG Image](public/images/og-image.png)

가챠샵(Gacha Shop)을 지도 기반으로 탐색하고, 리스트 및 상세 페이지를 통해 매장 정보를 확인할 수 있는 모바일 웹 서비스입니다.

🔗 배포 주소: [https://gotcha.it.com](https://gotcha.it.com)

---

## 주요 기능

- 🗺️ 카카오맵 기반 가챠샵 위치 탐색
- 🏪 매장 상세 정보 및 리뷰
- ⭐ 즐겨찾기
- 📝 새 업체 제보
- 📱 PWA 지원

### 예정 기능

- 📲 앱 출시 (iOS / Android)
- 🏠 사장님 페이지

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Kakao Map SDK
- Lucide React (아이콘)
- PWA 지원
- Vercel

### Backend

- Spring Boot 3.x
- Java 21
- Spring Data JPA
- PostgreSQL
- Swagger
- AWS EC2 / S3

🔗 백엔드 깃헙 레포지토리: [GOTCHA-BE](https://github.com/fcde-project9/GOTCHA-BE)

---

## 아키텍처 패턴

| 영역       | 패턴                                           |
| ---------- | ---------------------------------------------- |
| 상태 관리  | Zustand (전역) + TanStack Query (서버)         |
| API 레이어 | API Wrapper (`request.ts`) + Query Key Factory |
| 에러 처리  | QueryErrorBoundary                             |
| 인증       | Zustand Persist                                |

📖 상세: [`.ai/architecture.md`](.ai/architecture.md) | [`.ai/coding_standards.md`](.ai/coding_standards.md)

---

## CI/CD

GitHub Actions + Vercel을 사용한 자동 배포 파이프라인

| 브랜치 | 환경       | URL                                            |
| ------ | ---------- | ---------------------------------------------- |
| `dev`  | Preview    | [dev.gotcha.it.com](https://dev.gotcha.it.com) |
| `main` | Production | [gotcha.it.com](https://gotcha.it.com)         |

**배포 프로세스**: 코드 푸시 → 린트 검사 → 빌드 → Vercel 배포

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

5. 배포 환경

   프로덕션: [https://gotcha.it.com](https://gotcha.it.com)

---

## 프로젝트 폴더 구조

```
src/
├── app/           # Next.js App Router (페이지)
├── components/    # 컴포넌트 (common, features, mypage, report 등)
├── api/           # API 클라이언트, queries, mutations
├── stores/        # Zustand 상태 관리
├── hooks/         # 커스텀 훅
├── types/         # TypeScript 타입
├── utils/         # 유틸리티 함수
├── constants/     # 상수
├── styles/        # 스타일
└── lib/           # 외부 라이브러리 유틸
```

---

## AI 문서 활용 (.ai 폴더)

프로젝트의 `.ai/` 폴더에는 AI 도구(Claude, Cursor 등)와 개발자가 함께 참조하는 표준 문서가 포함되어 있습니다.

### 문서 목록

| 파일                                | 설명                                   |
| ----------------------------------- | -------------------------------------- |
| `daily-learnings/`                  | 일일 학습 기록 (`/wrap` 명령어로 생성) |
| `initial_setting.md`                | 프로젝트 초기 설정 가이드              |
| `coding_standards.md`               | 코딩 컨벤션 및 네이밍 규칙             |
| `nextjs16_best_practices.md`        | Next.js 16 + React 19 권장 패턴        |
| `nextjs16_migration_guide.md`       | Next.js 16 마이그레이션 가이드         |
| `seo_standards.md`                  | SEO 최적화 가이드                      |
| `modal_and_permission_standards.md` | 모달 및 권한 요청 UI 표준              |
| `BUTTON_COMPONENT.md`               | Button 컴포넌트 사용 가이드            |

### 활용 방법

1. **AI 도구 컨텍스트**: Claude Code, Cursor 등에서 코드 작성 시 `.ai/` 문서를 참조하여 프로젝트 컨벤션에 맞는 코드 생성

2. **온보딩**: 신규 개발자가 프로젝트 표준을 빠르게 파악

3. **일관성 유지**: 코딩 스타일, 컴포넌트 패턴, SEO 설정 등의 표준화

4. **학습 기록**: `daily-learnings/`에 새로 배운 개념을 정리하여 팀 내 지식 공유

### 문서 업데이트 원칙

- 코드와 문서가 불일치할 경우, `.ai/` 문서를 먼저 갱신한 후 코드 반영
- 새로운 패턴이나 컨벤션 도입 시 관련 문서 업데이트 필수
