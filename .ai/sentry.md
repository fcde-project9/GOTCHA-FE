# Sentry 에러 모니터링 가이드

## 개요

GOTCHA 프로젝트는 [Sentry](https://sentry.io)로 런타임 에러, 성능, 세션 리플레이를 수집한다.
Next.js (웹) + Capacitor (iOS 네이티브) 하이브리드 구성이라 두 환경 모두 같은 Sentry 프로젝트로 이벤트가 모인다.

- **웹**: `@sentry/nextjs` (client + server + edge 모두 지원)
- **iOS 네이티브 크래시**: `@sentry/capacitor`가 JS SDK를 래핑하고 iOS native SDK를 자동 연동

### 운영 계정

| 항목               | 값                                                |
| ------------------ | ------------------------------------------------- |
| Sentry 로그인 계정 | **GOTCHA! 팀 구글 계정** (`fcdegotcha@gmail.com`) |
| Organization slug  | `gotcha-aj`                                       |
| Project slug       | `gotcha-web` (웹/iOS 통합 단일 프로젝트)          |
| 대시보드           | https://gotcha-aj.sentry.io/issues/               |

> 🔐 계정 자격증명 분실 시 팀 구글 계정 복구 절차를 따른다.
> Auth Token이 노출되면 즉시 **Organization Settings → Auth Tokens**에서 revoke 후 재발급.

## 파일 구조

```
프로젝트 루트/
├── instrumentation-client.ts    # 브라우저/Capacitor 초기화 (빌드 타깃 분기)
├── instrumentation.ts            # 서버 런타임 등록 + onRequestError
├── sentry.server.config.ts       # Node.js 런타임 init
├── sentry.edge.config.ts         # Edge 런타임 init
├── next.config.mjs               # withSentryConfig() 래핑
└── src/app/
    └── global-error.tsx          # App Router 글로벌 에러 바운더리
```

## 환경 설정

### 로컬 개발 (`.env.local`)

```bash
# 필수 — 클라이언트/서버 공용 DSN (DSN 자체는 공개되어도 무방)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@oXXXXXX.ingest.sentry.io/XXXXXX

# 소스맵 업로드 (빌드 시에만 사용, 절대 클라이언트 노출 금지)
SENTRY_ORG=gotcha-aj
SENTRY_PROJECT=gotcha-web
SENTRY_AUTH_TOKEN=sntrys_xxx...    # Organization Auth Token (scope: org:ci)

# 선택 — 릴리스 식별자 (CI에서 git sha로 주입 권장)
# NEXT_PUBLIC_SENTRY_RELEASE=v1.2.3-abc1234
```

> ⚠️ `SENTRY_AUTH_TOKEN`은 **Organization Settings → Auth Tokens**에서 발급.
> scope는 `org:ci` 하나면 Source Map Upload + Release Creation + Code Mappings 다 됨.

### Vercel 배포

Settings → Environment Variables에 위 4개 등록. 적용 환경 체크박스에서
**Production + Preview 둘 다** 체크.

- `SENTRY_AUTH_TOKEN`은 **Sensitive로 표시**
- 환경 구분: 코드에서 `process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV`로
  `environment` 태깅. Vercel은 서버용 `VERCEL_ENV`만 자동 주입하고 `NEXT_PUBLIC_*`
  접두사 변수는 자동 주입하지 않으므로, `next.config.mjs`의 `env` 블록에서
  `NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV`로 매핑해 빌드타임에 클라이언트
  번들에 인라인한다. → Preview 배포는 Sentry에서 `environment: preview`로 분류되어
  Discord 알림(`production`만 필터)에 안 섞임.

> ⚠️ `next.config.mjs`의 `env` 매핑이 빠지면 클라이언트에서 `NEXT_PUBLIC_VERCEL_ENV`가
> `undefined` → `NODE_ENV`로 fallback → Vercel 빌드에선 NODE_ENV가 항상 `production`이라
> dev 서버 에러까지 `environment: production`으로 태깅되어 `#sentry-prod`에 섞이는
> 버그가 발생한다.

### iOS 빌드 (Capacitor)

```bash
NEXT_PUBLIC_BUILD_TARGET=capacitor npm run build:capacitor
npx cap sync ios
```

`instrumentation-client.ts`의 빌드 타깃 분기가 `NEXT_PUBLIC_BUILD_TARGET=capacitor`일 때
`@sentry/capacitor`를 init하도록 동작.

## 아키텍처

### 빌드 타깃 분기

| 빌드                                  | 클라이언트                                  | 서버/엣지       | 네이티브 크래시  |
| ------------------------------------- | ------------------------------------------- | --------------- | ---------------- |
| **웹** (`next build`)                 | `@sentry/nextjs` 직접 init + Replay         | ✓ 동작          | —                |
| **Capacitor iOS** (`build:capacitor`) | `@sentry/capacitor`로 `@sentry/nextjs` 래핑 | ✗ (정적 export) | ✓ iOS native SDK |

분기 키는 `process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor"`. 빌드 타임에 상수로 인라인되어
사용하지 않는 브랜치는 트리쉐이킹됨.

### withSentryConfig 옵션

`next.config.mjs`에서 `withSentryConfig()`로 래핑하고, Capacitor 빌드에선 일부 옵션 비활성화:

- `tunnelRoute: "/monitoring"` — 광고 차단기 우회용 rewrite. **Capacitor 정적 export엔 rewrite 불가하므로 비활성**
- `webpack.automaticVercelMonitors` — Vercel Cron 자동 등록. **Capacitor와 무관하므로 비활성**
- `webpack.treeshake.removeDebugLogging` — 디버그 로거 트리쉐이킹 (번들 ↓)
- `widenClientFileUpload` — 더 많은 파일의 소스맵 업로드

### 샘플링 정책

| 항목                       | dev        | prod       |
| -------------------------- | ---------- | ---------- |
| `tracesSampleRate`         | 1.0 (100%) | 0.1 (10%)  |
| `replaysSessionSampleRate` | 0.1 (10%)  | 0.1 (10%)  |
| `replaysOnErrorSampleRate` | 1.0 (100%) | 1.0 (100%) |

prod 트레이싱 10%는 비용 통제용. 에러 발생 세션은 100% 리플레이 캡처.

## 사용법

### 자동 캡처

별도 코드 없이 자동으로 잡히는 것들:

- React 컴포넌트 렌더 중 throw → `global-error.tsx`가 잡아서 자동 전송
- `<ErrorBoundary>`로 잡힌 React 트리 에러 → `componentDidCatch`에서 자동 전송 (`componentStack` 컨텍스트 포함)
- `window.onerror` / `unhandledrejection` → SDK 글로벌 핸들러
- Next.js 서버 사이드 에러 → `instrumentation.ts`의 `onRequestError`
- iOS 네이티브 크래시 (Capacitor 빌드만) → @sentry/capacitor가 자동

### 수동 캡처

```ts
import * as Sentry from "@sentry/nextjs";

try {
  await someRiskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "review-write" },
    contexts: { review: { shopId, contentLength } },
  });
  throw error; // UI에서 처리해야 한다면 다시 던지기
}
```

### 메시지/브레드크럼

```ts
// 비-에러 이벤트
Sentry.captureMessage("결제 토큰 만료 — 자동 재로그인 시도", "warning");

// 디버깅 컨텍스트 (이후 에러 발생 시 첨부)
Sentry.addBreadcrumb({
  category: "auth",
  message: "사용자 카카오 로그인 시도",
  level: "info",
});
```

### 사용자 식별

로그인 직후 `Providers` 같은 곳에서:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.setUser({
  id: user.id,
  // email/username은 PII 정책에 따라 결정. 사내 정책 확인 필요
});

// 로그아웃 시
Sentry.setUser(null);
```

> 개인정보보호 관점에서 `email`/`username` 같은 PII는 기본 비전송 권장. 필요 시 Sentry의 `beforeSend` 후크로 스크럽.

## 소스맵

`SENTRY_AUTH_TOKEN`만 있으면 `next build` / `build:capacitor` 시 자동 업로드됨.
업로드 안 되면 스택트레이스가 난독화된 채로 보임 (라인이 `chunks/abc123.js:1:9482` 같이 표시).

### 검증

빌드 로그에 다음과 비슷한 줄이 나오면 성공:

```
[@sentry/webpack-plugin] Successfully uploaded source maps to Sentry
```

## iOS 네이티브 (Capacitor)

### 설치 후 1회 실행

```bash
npx cap sync ios
cd ios/App && pod install
```

이로써 `Sentry-Cocoa` Pod이 설치되고, `@sentry/capacitor`의 JS init이 자동으로 native bridge를 활성화.

### dSYM 업로드 (Xcode 빌드 시)

iOS native 크래시의 심볼리케이션을 위해 dSYM이 Sentry에 업로드되어야 함.
**SPM Sentry는 archive에 dSYM이 자동 포함되지 않으므로** 빌드 단계에서 sentry-cli로
업로드하는 작업이 필수다 (안 하면 `Sentry.framework + 0x1234` 같이 난독화됨).

#### 1회 셋업 (개발자 머신마다)

##### A. `sentry-cli` 설치

```bash
brew install getsentry/tools/sentry-cli
```

##### B. `.env.local`에 Sentry 키 4개 채워두기 (이미 있을 수 있음)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=gotcha-aj
SENTRY_PROJECT=gotcha-web
SENTRY_AUTH_TOKEN=sntrys_xxx...
```

##### C. Xcode에 Run Script Phase 추가 (저장소당 1회)

1. Xcode → Project navigator → **App** (target) 선택
2. **Build Phases** 탭 → 좌상단 **`+`** → **New Run Script Phase**
3. Phase 이름을 `Upload Sentry dSYMs` 로 변경
4. Shell: `/bin/sh` (기본값 유지)
5. 스크립트 본문에 다음 한 줄 입력:

   ```sh
   "${SRCROOT}/../../scripts/upload-dsym.sh"
   ```

6. **Run script only when installing** 는 체크 해제(=Archive에서 실행됨)
7. **For install builds only** 도 체크 해제
8. Phase 순서: 기본 위치(맨 아래) 유지. Archive 시 dSYM 생성 후 실행됨

> Run Script가 git에 커밋되는 영역(`pbxproj`)이라 1명이 추가하면 팀 전체에 적용된다.
> 스크립트 본체는 `scripts/upload-dsym.sh` 한 곳에서 관리한다.

#### `scripts/upload-dsym.sh` 동작

- `.env.local`에서 `SENTRY_*` 환경변수 자동 로드 (Xcode 빌드 환경엔 `.env.local`이
  안 보이므로 스크립트가 직접 파싱해서 export — 단, 다른 키는 건드리지 않음)
- `DWARF_DSYM_FOLDER_PATH` (Xcode가 자동 주입) 또는 첫 인자로 받은 경로의 dSYM을
  Sentry에 업로드
- `--include-sources`로 소스맵 함께 업로드 → 스택트레이스에 코드 인용 표시

#### Archive 사후 수동 호출 (Run Script Phase 누락된 빌드 복구용)

이전 Archive에서 dSYM이 안 올라간 경우:

1. Xcode → Window → Organizer
2. 해당 Archive 우클릭 → **Show in Finder**
3. `.xcarchive` 우클릭 → **Package Contents** → `dSYMs` 폴더 경로 복사
4. 터미널에서:

   ```bash
   bash scripts/upload-dsym.sh "<dSYMs 폴더 경로>"
   ```

#### 빌드 로그 확인

Run Script Phase가 동작하면 Archive 로그 마지막에 다음 줄이 보인다:

```text
▶ Sentry dSYM 업로드 — org=gotcha-aj project=gotcha-web
✅ Sentry dSYM 업로드 완료
```

Archive 직후 dSYM 누락 경고가 안 뜨면 성공.

## 검증 방법

### 1. 일회성 Node 스크립트 (DSN/네트워크 검증)

```bash
node --no-warnings -e '
import("@sentry/node").then(async (Sentry) => {
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, environment: "verify" });
  Sentry.captureException(new Error("[SENTRY VERIFY] " + new Date().toISOString()));
  await Sentry.flush(5000);
  process.exit(0);
})'
```

`event id` 출력 + `flushed: true`면 성공. 30초 안에 Sentry 대시보드 → Issues 탭에 이벤트 표시.

### 2. 브라우저 클라이언트 에러

```bash
npm run dev
# 브라우저 http://localhost:3000/test-error 접속
# 5번 섹션 → "Error Boundary 테스트 보기" → "에러 발생시키기"
```

> `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`)는 `componentDidCatch`에서 `Sentry.captureException`을 호출하므로 트리 안 에러도 자동 전송된다. fallback UI는 뜨고 Sentry에도 같이 들어감.
> 글로벌 unhandled 경로(`window.onerror`)까지 확인하려면 브라우저 콘솔에서 `setTimeout(() => { throw new Error("client test"); }, 0);` 실행.

### 3. 서버 사이드 에러

Next.js 페이지 RSC/loader에서 throw → 자동으로 `onRequestError`가 캡처.

## 알림 (Discord)

이슈가 Sentry에 들어오면 Discord 채널로 자동 알림.

### 연결 구조

- Sentry **Discord Integration**(공식)을 통한 봇 연동 — webhook 방식보다 메시지 포맷이 깔끔 (이슈 링크, 미리보기, "Resolve" 버튼 포함)
- Discord 봇 설치엔 `Manage Server` 권한 필요 → 팀 알림용 별도 Discord 서버 운영 권장

### 알림 채널 구성

| 채널           | Sentry environment | 대상 배포                  | 트리거                          |
| -------------- | ------------------ | -------------------------- | ------------------------------- |
| `#sentry-prod` | `production`       | `www.gotcha.it.com` (main) | 신규 이슈 / escalating / 재발생 |
| `#sentry-dev`  | `preview`          | `dev.gotcha.it.com` (dev)  | 신규 이슈 / escalating          |

> **환경 작명**: `next.config.mjs`의 `env` 매핑으로 Vercel이 주입하는 `VERCEL_ENV` 값(`production` / `preview` / `development`)이 그대로 `NEXT_PUBLIC_VERCEL_ENV`에 인라인되어 Sentry environment 태그로 박힌다. 알림 룰의 environment 필터도 동일한 값(`production`, `preview`)으로 설정한다.
>
> ⚠️ PR 자동 preview 배포가 활성화돼 있다면 같은 `preview` 환경으로 들어와 `#sentry-dev`에 섞일 수 있다. 노이즈가 심해지면 `dev-deploy.yml`에서 별도 env 주입(예: `NEXT_PUBLIC_VERCEL_ENV=dev` override)으로 분리 검토.

### 알림 규칙 (Sentry → Alerts → Issue Alert)

#### 운영 (production)

- **Source**: project = `gotcha-web`
- **Environment**: `production`
- **WHEN** (any of):
  - `A new issue is created` ✓ 필수
  - `An issue escalates` ✓ 필수 (잠잠하던 에러 폭증)
  - `A resolved issue becomes unresolved` ✓ 권장 (재발 추적)
  - `An issue is resolved` ✗ 비권장 (메시지 폭주)
- **THEN**: `Send a Discord notification` → `#sentry-prod`
- **Throttling**: 30분

#### 개발 (dev)

- **Source**: project = `gotcha-web`
- **Environment**: `preview`
- **WHEN** (any of):
  - `A new issue is created` ✓
  - `An issue escalates` ✓
  - `A resolved issue becomes unresolved` ✗ (dev에선 노이즈)
- **THEN**: `Send a Discord notification` → `#sentry-dev`
- **Rate Limit**: `최대 10건 / 60분` 권장 (dev 이슈 폭증 시 채널 도배 방지)

### 알림 메시지에서 받는 정보

- 에러 메시지 / 스택 첫 몇 줄
- 환경 / 릴리스 / 사용자 수 / 발생 횟수
- Sentry 이슈 페이지 직접 링크
- (선택) 버튼: `Resolve`, `Archive`, `Assign`

## 트러블슈팅

### "이벤트는 보냈는데 Sentry에 안 떠요"

1. **DSN 오타**: 대시보드 → Settings → Client Keys (DSN)에서 비교
2. **광고 차단기**: 일부 차단기가 `*.ingest.sentry.io`를 막음 → `tunnelRoute: "/monitoring"`이 우회 (웹 빌드에서만 동작)
3. **샘플링**: prod에서 `tracesSampleRate: 0.1`이면 90%가 안 보냄. **에러는 100% 전송**되지만 트랜잭션은 샘플링 적용
4. **`enabled: false`**: DSN이 없으면 자동으로 비활성. `.env.local` 다시 확인
5. **CORS / 네트워크**: 브라우저 콘솔에서 `*.ingest.sentry.io` 호출 실패 로그 확인

### "스택트레이스가 chunks/abc.js:1:9482 처럼 난독화돼요"

소스맵이 Sentry로 업로드 안 된 것. 위의 [소스맵](#소스맵) 섹션 참고.

### "Capacitor 빌드에서 build 깨져요"

- `tunnelRoute`가 활성화돼 있는지 확인. `next.config.mjs`에서 `isCapacitor ? undefined : "/monitoring"` 분기 유지 필수
- `output: "export"`와 호환 안 되는 Sentry 기능: API routes 기반 features 전부 (tunneling, cron, etc.)

### "@sentry/capacitor와 @sentry/nextjs 타입 충돌"

두 패키지가 서로 다른 `@sentry/core` 버전을 nested 의존성으로 가져옴.
`instrumentation-client.ts`에서 `@sentry/capacitor`를 `require()`로 받는 이유.
직접 `import` 후 두 SDK의 integration 객체를 섞으면 타입 에러 발생.

### "PII가 자꾸 들어가요"

`Sentry.init({ sendDefaultPii: false })` 명시 + `beforeSend` 후크로 추가 스크럽:

```ts
Sentry.init({
  beforeSend(event) {
    if (event.user) delete event.user.email;
    return event;
  },
});
```

## 참고 자료

- [공식 Next.js 가이드](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Capacitor 가이드](https://docs.sentry.io/platforms/javascript/guides/capacitor/)
- [Source maps 트러블슈팅](https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js/)
- 프로젝트 SDK 버전: `@sentry/nextjs@10.43.0` (exact), `@sentry/capacitor@^4.0.0`
  > `@sentry/capacitor`가 sibling `@sentry/core`를 정확히 10.43.0으로 고정하므로
  > `@sentry/nextjs`도 같은 버전으로 핀해야 빌드 통과. 업그레이드 시 둘이 같은 버전으로 같이 올려야 함.
