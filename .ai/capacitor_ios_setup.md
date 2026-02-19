# Capacitor iOS 앱 래핑 구현 가이드

> 작성일: 2026-02-18

이 문서는 GOTCHA-FE Next.js 웹앱을 Capacitor로 감싸서 iOS 네이티브 앱으로 빌드하는 전체 구현 내용을 설명합니다.

## 목차

1. [개요](#1-개요)
2. [아키텍처](#2-아키텍처)
3. [Next.js 정적 내보내기 설정](#3-nextjs-정적-내보내기-설정)
4. [Capacitor 설정](#4-capacitor-설정)
5. [플랫폼 감지](#5-플랫폼-감지)
6. [푸시 알림 분기](#6-푸시-알림-분기)
7. [OAuth 딥링크](#7-oauth-딥링크)
8. [iOS 네이티브 설정](#8-ios-네이티브-설정)
9. [빌드 및 배포](#9-빌드-및-배포)
10. [주의사항 및 트러블슈팅](#10-주의사항-및-트러블슈팅)

---

## 1. 개요

### 목적

- GOTCHA! 웹앱을 iOS App Store에 제출하기 위한 네이티브 앱 래핑
- 기존 웹 배포에 영향 없이 `NEXT_PUBLIC_BUILD_TARGET` 환경변수로 분기

### 기술 스택

| 항목          | 내용                       |
| ------------- | -------------------------- |
| 프레임워크    | Capacitor 8                |
| 웹 프레임워크 | Next.js 16 (정적 내보내기) |
| 번들 ID       | `com.it.gotcha.app`        |
| URL 스킴      | `gotchaapp://`             |
| 최소 iOS      | 14.0+                      |

### 설치된 Capacitor 플러그인

```
@capacitor/core, @capacitor/ios, @capacitor/cli
@capacitor/push-notifications  — APNS 네이티브 푸시
@capacitor/geolocation         — 위치 권한
@capacitor/camera               — 카메라/사진 앨범
@capacitor/status-bar           — 상태바 스타일
@capacitor/splash-screen        — 스플래시 제어
@capacitor/app                  — 앱 이벤트/딥링크
@capacitor/keyboard             — 키보드 리사이즈
@capacitor/browser              — 인앱 브라우저 (OAuth용)
@capacitor/haptics              — 햅틱 피드백
```

---

## 2. 아키텍처

### 빌드 분기 흐름

```
환경변수 NEXT_PUBLIC_BUILD_TARGET
  ├── (미설정/기본) → 기존 웹 빌드 (SSR, rewrites, next/image 최적화)
  └── "capacitor"  → 정적 내보내기 (output: "export", unoptimized images)
                      └── out/ 디렉토리 생성
                           └── npx cap sync ios → iOS 프로젝트에 복사
                                └── Xcode 빌드 → .ipa 생성
```

### 런타임 분기 흐름

```
isNativeApp() (Capacitor.isNativePlatform())
  ├── true (iOS 앱)
  │   ├── 서비스워커 등록 건너뛰기
  │   ├── APNS 토큰으로 푸시 등록
  │   ├── @capacitor/browser로 OAuth 진행
  │   ├── gotchaapp:// 딥링크로 OAuth 복귀
  │   └── StatusBar/SplashScreen/Keyboard 네이티브 초기화
  └── false (웹 브라우저)
      ├── 기존 서비스워커 등록
      ├── VAPID Web Push 구독
      ├── window.location.replace로 OAuth 진행
      └── 네이티브 초기화 건너뛰기
```

---

## 3. Next.js 정적 내보내기 설정

### next.config.mjs

```js
const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

const nextConfig = {
  ...(isCapacitor && { output: "export" }),
  ...(!isCapacitor && {
    async rewrites() {
      /* API 프록시 */
    },
  }),
  images: {
    ...(isCapacitor && { unoptimized: true }),
    remotePatterns: [
      /* S3 등 */
    ],
  },
};
```

**핵심 포인트:**

- Capacitor 빌드 시 `output: "export"`로 `out/` 디렉토리에 정적 파일 생성
- API rewrites는 정적 내보내기에서 불가 → `NEXT_PUBLIC_API_BASE_URL`로 직접 호출
- `next/image` 최적화 비활성화 (`unoptimized: true`)

### 루트 페이지 리디렉션

서버 사이드 `redirect("/home")`은 정적 내보내기에서 사용 불가.
클라이언트 사이드 `router.replace("/home")`으로 변경.

```tsx
// src/app/page.tsx
"use client";
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home");
  }, [router]);
  return null;
}
```

### 동적 라우트 처리 (`/shop/[id]`)

**문제:** `output: "export"`에서 동적 라우트는 `generateStaticParams()` 필수.

**Next.js 16 버그 발견:**
`generateStaticParams()`가 빈 배열 `[]`을 반환하면, 내부 체크 로직에서 `prerenderedRoutes.length > 0`이 `false`가 되어 "missing generateStaticParams" 에러 발생.

```js
// node_modules/next/dist/build/index.js:1373
const hasGenerateStaticParams =
  workerResult.prerenderedRoutes && workerResult.prerenderedRoutes.length > 0;
// ↑ 빈 배열이면 false → throw
```

**해결:** 더미 파라미터 `[{ id: "0" }]` 반환으로 체크 통과.

```tsx
// src/app/shop/[id]/page.tsx (서버 래퍼)
import ShopDetailClient from "./ShopDetailClient";

export function generateStaticParams() {
  return [{ id: "0" }]; // 최소 1개 필요
}

export default function ShopDetailPage() {
  return <ShopDetailClient />;
}
```

**파일 구조 변경:**
기존 `"use client"` 페이지를 서버 래퍼 + 클라이언트 컴포넌트로 분리:

```
src/app/shop/[id]/
  ├── layout.tsx              ← 서버 컴포넌트 (SEO, JSON-LD)
  ├── page.tsx                ← 서버 래퍼 (generateStaticParams)
  ├── ShopDetailClient.tsx    ← 클라이언트 컴포넌트 (기존 로직)
  ├── images/
  │   ├── page.tsx            ← 서버 래퍼
  │   └── ImagesGalleryClient.tsx
  └── reviews/
      ├── page.tsx            ← 서버 래퍼
      └── ReviewsListClient.tsx
```

### SEO 라우트 호환

`sitemap.ts`, `robots.ts`에 `export const dynamic = "force-static"` 추가.

### shop layout 조건 분기

서버 사이드 fetch(`generateMetadata`, JSON-LD)는 Capacitor 빌드 시 건너뛰기:

```tsx
const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

export async function generateMetadata({ params }) {
  if (isCapacitor) return { title: "GOTCHA!" };
  // ... 기존 서버 fetch 로직
}

export default async function ShopLayout({ children, params }) {
  if (isCapacitor) return <>{children}</>;
  // ... 기존 JSON-LD 로직
}
```

---

## 4. Capacitor 설정

### capacitor.config.ts

```ts
const config: CapacitorConfig = {
  appId: "com.it.gotcha.app",
  appName: "GOTCHA!",
  webDir: "out",
  server: {
    // url: "https://dev.gotcha.it.com", // 개발 시에만 사용. 배포 시 반드시 제거 (로컬 번들 사용)
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: "#ffffff" },
    Keyboard: { resize: "body", resizeOnFullScreen: true },
  },
};
```

> **주의:** `server.url`을 설정하면 WebView가 해당 원격 URL을 로드합니다.
>
> - **개발/테스트:** `server.url`에 dev 서버 주소를 넣어 빌드 없이 빠르게 테스트 가능
> - **배포(App Store):** `server.url`을 **반드시 제거**하여 `webDir`(`out/`)의 로컬 번들을 사용

### package.json 스크립트

```json
{
  "build:capacitor": "NEXT_PUBLIC_BUILD_TARGET=capacitor next build",
  "cap:sync": "npx cap sync",
  "cap:open:ios": "npx cap open ios",
  "build:ios": "npm run build:capacitor && npx cap sync ios && npx cap open ios"
}
```

---

## 5. 플랫폼 감지

### src/utils/platform.ts

```ts
import { Capacitor } from "@capacitor/core";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): string {
  return Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}
```

**사용처:**

- `ServiceWorkerRegistration.tsx` — 네이티브에서 SW 등록 건너뛰기
- `providers.tsx` — 네이티브 초기화, 푸시 분기
- `support.ts` — OAuth 분기

---

## 6. 푸시 알림 분기

### src/utils/pushNotifications.ts

| 환경     | 방식           | 엔드포인트                       |
| -------- | -------------- | -------------------------------- |
| 웹       | VAPID Web Push | `POST /api/push/subscribe`       |
| 네이티브 | APNS 토큰      | `POST /api/push/register-device` |

```ts
export async function registerPushNotifications() {
  if (isNativeApp()) {
    // @capacitor/push-notifications로 APNS 토큰 획득
    // → POST /api/push/register-device { token, platform: "ios" }
  } else {
    // 기존 VAPID Web Push 구독 로직
    // → POST /api/push/subscribe { endpoint, keys }
  }
}
```

**providers.tsx 변경:**

- 기존 인라인 `registerPushSubscription()` 제거
- 통합 `registerPushNotifications()` 사용
- `checkNativePushPermission()`으로 웹/네이티브 통합 권한 확인

---

## 7. OAuth 딥링크

### 흐름

```
[네이티브 앱]
  1. 로그인 버튼 클릭
  2. @capacitor/browser로 인앱 브라우저 열기
     → https://api.gotcha.it.com/oauth2/authorize/kakao?redirect_uri=gotchaapp://oauth/callback
  3. 사용자가 OAuth 인증 완료
  4. 백엔드가 gotchaapp://oauth/callback?code=...&state=... 로 리디렉트
  5. iOS가 URL 스킴 감지 → 앱으로 복귀
  6. useDeepLink 훅이 appUrlOpen 이벤트 수신
  7. 인앱 브라우저 닫기 + /oauth/callback 페이지로 내부 네비게이션
```

### src/hooks/useDeepLink.ts

```ts
export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;

    const handleUrlOpen = async (event) => {
      await Browser.close();
      const url = new URL(event.url);
      if (url.pathname.includes("oauth/callback")) {
        router.replace(`/oauth/callback${url.search}`);
      }
    };

    let handle: Awaited<ReturnType<typeof App.addListener>> | undefined;
    let cancelled = false;

    App.addListener("appUrlOpen", handleUrlOpen).then((h) => {
      if (cancelled) {
        h.remove(); // cleanup이 먼저 실행된 경우 즉시 제거
      } else {
        handle = h;
      }
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [router]);
}
```

### src/utils/support.ts 변경

```ts
async function redirectToOAuth(provider, providerDisplayName) {
  const callbackUrl = isNativeApp()
    ? "gotchaapp://oauth/callback" // 커스텀 URL 스킴
    : `${window.location.origin}/oauth/callback`; // 웹 오리진

  if (isNativeApp()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: oauthUrl }); // 인앱 브라우저
  } else {
    window.location.replace(oauthUrl); // 기존 리디렉트
  }
}
```

---

## 8. iOS 네이티브 설정

### Info.plist 추가 항목

```xml
<!-- 권한 설명 -->
<key>NSCameraUsageDescription</key>
<string>리뷰 사진 촬영을 위해 카메라 접근 권한이 필요합니다.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>리뷰에 사진을 첨부하기 위해 사진 앨범 접근 권한이 필요합니다.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>주변 매장을 찾기 위해 위치 정보가 필요합니다.</string>

<!-- 커스텀 URL 스킴 (OAuth 딥링크) -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.it.gotcha.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>gotchaapp</string>
    </array>
  </dict>
</array>
```

### App.entitlements (APNs 환경)

`ios/App/App/App.entitlements`에서 푸시 알림 환경을 설정합니다.

```xml
<key>aps-environment</key>
<string>production</string>
```

> **주의:** `development`로 설정하면 TestFlight/App Store 빌드에서 프로덕션 APNs에 연결되지 않습니다.
> `production`으로 설정해도 Debug 빌드 시 프로비저닝 프로파일이 sandbox APNs를 사용하므로 개발 푸시 테스트에 영향 없습니다.

### AppDelegate.swift (APNs 콜백)

`@capacitor/push-notifications` 플러그인이 APNS 토큰 등록 결과를 수신하려면 `AppDelegate`에 아래 두 메서드가 필요합니다. 없으면 `registration` / `registrationError` 이벤트가 발생하지 않습니다.

```swift
// ios/App/App/AppDelegate.swift

func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NotificationCenter.default.post(
        name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
}

func application(_ application: UIApplication,
                 didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(
        name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}
```

### 앱 아이콘

`public/images/icon-512.png`를 1024x1024로 리사이즈하여 적용:
`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

### 네이티브 앱 초기화 (providers.tsx)

```ts
useEffect(() => {
  if (!isNativeApp()) return;
  const init = async () => {
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      const { Keyboard } = await import("@capacitor/keyboard");
      await StatusBar.setStyle({ style: Style.Light }); // 어두운 텍스트
      await Keyboard.setResizeMode({ mode: "body" });
    } finally {
      // import/초기화 실패 시에도 스플래시는 반드시 숨기기
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // SplashScreen import 자체가 실패하면 무시
      }
    }
  };
  init();
}, []);
```

---

## 9. 빌드 및 배포

### Capacitor 빌드 명령

```bash
# 1. 정적 빌드 + iOS 동기화 + Xcode 열기
npm run build:ios

# 또는 개별 실행:
npm run build:capacitor    # out/ 디렉토리 생성
npx cap sync ios           # iOS 프로젝트에 웹 에셋 복사 + 플러그인 동기화
npx cap open ios           # Xcode 열기
```

### 환경변수

`.env.capacitor` 파일을 `.env.local`로 복사하여 사용:

```bash
cp .env.capacitor .env.local
npm run build:capacitor
```

**필수 환경변수:**

- `NEXT_PUBLIC_BUILD_TARGET=capacitor`
- `NEXT_PUBLIC_API_BASE_URL=https://api.gotcha.it.com` (직접 API URL, 프록시 불가)
- `NEXT_PUBLIC_KAKAO_MAP_KEY`, OAuth 클라이언트 ID 등

### Xcode 빌드

1. `npx cap open ios`로 Xcode 프로젝트 열기
2. Signing & Capabilities에서 Apple Developer 팀 선택
3. Bundle Identifier: `com.it.gotcha.app` 확인
4. Push Notifications capability 추가
5. 시뮬레이터 또는 실기기에서 빌드/실행

---

## 10. 주의사항 및 트러블슈팅

### 웹 빌드 영향 없음

- `NEXT_PUBLIC_BUILD_TARGET`이 설정되지 않으면 기존 웹 빌드와 동일
- Capacitor 관련 코드는 `isNativeApp()` 체크로 웹에서 실행되지 않음
- `@capacitor/core`의 `Capacitor.isNativePlatform()`은 웹에서 항상 `false` 반환

### generateStaticParams 빈 배열 버그

Next.js 16.1.6에서 `generateStaticParams()`가 `[]`을 반환하면 `output: "export"` 체크를 통과하지 못함.
반드시 최소 1개의 더미 파라미터 필요 (`[{ id: "0" }]`).

### API 호출 경로

| 환경          | API 호출 방식                                            |
| ------------- | -------------------------------------------------------- |
| 웹 (dev/prod) | `/api/*` → Next.js rewrites → `NEXT_PUBLIC_API_BASE_URL` |
| Capacitor     | `NEXT_PUBLIC_API_BASE_URL`로 직접 호출 (axios baseURL)   |

Capacitor 환경에서는 rewrites가 없으므로, `axios` baseURL이 정확한 API 서버 주소여야 함.

### 백엔드 필수 작업

자세한 내용은 `.ai/capacitor-backend-requirements.md` 참조.

1. **CORS**: `capacitor://localhost` 오리진 허용
2. **OAuth**: `gotchaapp://oauth/callback` redirect_uri 허용
3. **Kakao**: `capacitor://localhost` 도메인 + 번들 ID 등록
4. **APNS**: `POST /api/push/register-device` 엔드포인트 + APNS 인증서

### 변경된 파일 목록

| 파일                                               | 변경 내용                              |
| -------------------------------------------------- | -------------------------------------- |
| `next.config.mjs`                                  | 조건부 정적 내보내기                   |
| `capacitor.config.ts`                              | Capacitor 설정 (신규)                  |
| `tsconfig.json`                                    | capacitor.config.ts exclude            |
| `package.json`                                     | Capacitor 패키지 + 빌드 스크립트       |
| `.gitignore`                                       | `ios/App/Pods/`, `.env.capacitor` 예외 |
| `.env.capacitor`                                   | Capacitor 빌드 환경변수 템플릿 (신규)  |
| `src/app/page.tsx`                                 | 클라이언트 사이드 리디렉트             |
| `src/app/providers.tsx`                            | 통합 푸시, 딥링크, 네이티브 초기화     |
| `src/app/sitemap.ts`                               | `force-static` 추가                    |
| `src/app/robots.ts`                                | `force-static` 추가                    |
| `src/app/shop/[id]/layout.tsx`                     | Capacitor 분기 (SEO 건너뛰기)          |
| `src/app/shop/[id]/page.tsx`                       | 서버 래퍼로 분리                       |
| `src/app/shop/[id]/ShopDetailClient.tsx`           | 클라이언트 컴포넌트 (신규)             |
| `src/app/shop/[id]/images/page.tsx`                | 서버 래퍼로 분리                       |
| `src/app/shop/[id]/images/ImagesGalleryClient.tsx` | 클라이언트 컴포넌트 (신규)             |
| `src/app/shop/[id]/reviews/page.tsx`               | 서버 래퍼로 분리                       |
| `src/app/shop/[id]/reviews/ReviewsListClient.tsx`  | 클라이언트 컴포넌트 (신규)             |
| `src/utils/platform.ts`                            | 플랫폼 감지 유틸 (신규)                |
| `src/utils/pushNotifications.ts`                   | 통합 푸시 등록 (신규)                  |
| `src/utils/support.ts`                             | OAuth 네이티브 분기                    |
| `src/utils/index.ts`                               | platform export 추가                   |
| `src/hooks/useDeepLink.ts`                         | 딥링크 훅 (신규)                       |
| `src/hooks/index.ts`                               | useDeepLink export 추가                |
| `src/components/pwa/ServiceWorkerRegistration.tsx` | 네이티브 SW 건너뛰기                   |
| `src/api/endpoints.ts`                             | `PUSH.REGISTER_DEVICE` 추가            |
| `ios/`                                             | Capacitor iOS 프로젝트 (신규)          |
| `ios/App/App/Info.plist`                           | 권한 설명 + URL 스킴                   |
