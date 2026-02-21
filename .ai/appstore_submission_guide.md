# App Store 제출 준비 가이드

> 작성일: 2026-02-21

GOTCHA! 앱(Next.js + Capacitor iOS)을 App Store에 제출하기 위한 전체 준비 과정을 설명합니다.

## 목차

1. [사전 조건](#1-사전-조건)
2. [코드/설정 점검 결과](#2-코드설정-점검-결과)
3. [배포 빌드 생성](#3-배포-빌드-생성)
4. [Xcode Archive 및 업로드](#4-xcode-archive-및-업로드)
5. [App Store Connect 설정](#5-app-store-connect-설정)
6. [심사 제출 체크리스트](#6-심사-제출-체크리스트)

---

## 1. 사전 조건

| 항목                                   | 상태 |
| -------------------------------------- | ---- |
| Apple Developer 계정                   | 완료 |
| App Store Connect 앱 등록              | 완료 |
| Bundle ID: `com.it.gotcha.app`         | 완료 |
| Push Notification 인증서/키            | 완료 |
| `server.url` 분기 처리 (환경변수 기반) | 완료 |

---

## 2. 코드/설정 점검 결과

### 앱 아이콘

- **파일**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
- **크기**: 1024x1024 PNG, RGBA
- **Contents.json**: `universal` idiom, `ios` platform, `1024x1024` size
- **상태**: 정상 (Xcode 15+에서 단일 1024x1024 아이콘으로 모든 크기 자동 생성)

### 버전 번호

- `MARKETING_VERSION`: 1.0 (App Store에 표시되는 버전)
- `CURRENT_PROJECT_VERSION`: 1 (빌드 번호)
- Debug/Release 모두 동일
- **상태**: 첫 출시 기준 적절

### Info.plist 권한 설명

| 키                                    | 설명                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `NSCameraUsageDescription`            | 리뷰 사진 촬영을 위해 카메라 접근 권한이 필요합니다.          |
| `NSLocationWhenInUseUsageDescription` | 주변 매장을 찾기 위해 위치 정보가 필요합니다.                 |
| `NSPhotoLibraryUsageDescription`      | 리뷰에 사진을 첨부하기 위해 사진 앨범 접근 권한이 필요합니다. |

> 푸시 알림(Push Notifications)은 Info.plist에 별도 usage description 키가 없습니다. 권한 다이얼로그는 `UNUserNotificationCenter.requestAuthorization()` 호출 시 시스템이 자동으로 표시합니다.

### Privacy Manifest (PrivacyInfo.xcprivacy)

Apple은 Required Reason API(`UserDefaults`, `NSFileSystemFreeSize` 등)를 사용하는 앱에 Privacy Manifest를 요구합니다. 누락 시 **ITMS-91053** 경고 또는 리젝 대상입니다.

Capacitor 앱은 내부적으로 `UserDefaults`를 사용하므로 이 파일이 필요합니다.

1. Xcode에서 **App 타겟 → Build Phases → Copy Bundle Resources**에 `PrivacyInfo.xcprivacy` 추가
2. 사용 중인 Required Reason API와 해당 reason code를 명시
3. Xcode에서 **Product → Archive** 전에 빌드 경고가 없는지 확인

### Entitlements

- `aps-environment`: `production` (Push Notification)
- 파일: `ios/App/App/App.entitlements`

### Capacitor 설정 (`capacitor.config.ts`)

```ts
const isDev = process.env.CAP_DEV_SERVER === "true";

const config: CapacitorConfig = {
  appId: "com.it.gotcha.app",
  appName: "GOTCHA!",
  webDir: "out",
  server: {
    ...(isDev && { url: "https://dev.gotcha.it.com" }),
    androidScheme: "https",
  },
  // ...
};
```

- `CAP_DEV_SERVER=true`일 때만 원격 서버 URL 사용
- 배포 빌드(`npm run build:ios`)에서는 `CAP_DEV_SERVER`가 설정되지 않아 로컬 번들(`out/`) 사용

---

## 3. 배포 빌드 생성

```bash
# 프로젝트 루트에서 실행
npm run build:ios
```

이 명령어는 순차적으로 실행됩니다:

1. `NEXT_PUBLIC_BUILD_TARGET=capacitor next build` → `out/` 디렉토리에 정적 파일 생성
2. `npx cap sync ios` → iOS 프로젝트에 웹 에셋 복사 + 플러그인 동기화
3. `npx cap open ios` → Xcode 자동 열기

---

## 4. Xcode Archive 및 업로드

### Step 1: Signing & Capabilities 확인

1. Xcode에서 **App 타겟** 선택
2. **Signing & Capabilities** 탭 이동
3. 확인할 항목:
   - **Team**: Apple Developer 계정의 팀 선택
   - **Bundle Identifier**: `com.it.gotcha.app`
   - **Signing Certificate**: `Apple Distribution` (자동 서명 사용 시 자동 설정)
   - **Provisioning Profile**: App Store용 프로필
   - **Push Notifications** capability가 추가되어 있는지 확인

> 자동 서명(Automatically manage signing)이 켜져 있으면 Xcode가 알아서 처리합니다.

### Step 2: 빌드 대상 설정

- Xcode 상단의 디바이스 선택 → **Any iOS Device (arm64)** 선택
- 시뮬레이터가 아닌 실제 디바이스 대상이어야 Archive가 가능

### Step 3: Archive 생성

1. 메뉴: **Product → Archive**
2. 빌드가 완료되면 **Organizer** 창이 자동으로 열림
3. 방금 생성된 Archive가 목록에 나타남

### Step 4: App Store Connect에 업로드

1. Organizer에서 Archive 선택 → **Distribute App** 클릭
2. **App Store Connect** 선택 → **Upload** 클릭
3. 옵션 확인:
   - **Strip Swift symbols**: 체크
   - **Upload your app's symbols**: 체크 (크래시 리포트용)
   - **Manage Version and Build Number**: 자동 관리 체크
4. **Upload** 클릭
5. 검증 통과 후 업로드 완료 (5~10분 소요)

### Step 5: 빌드 처리 대기

- [App Store Connect](https://appstoreconnect.apple.com) 접속
- **나의 앱 → GOTCHA!** 선택
- **TestFlight** 탭에서 업로드된 빌드 확인
- 빌드 처리 상태가 "준비 완료"로 바뀔 때까지 대기 (보통 10~30분)

---

## 5. App Store Connect 설정

### TestFlight 테스트 (권장)

1. TestFlight 탭 → 내부 테스트 그룹 생성
2. 테스터 추가 (이메일)
3. 빌드 배포 → 테스터가 TestFlight 앱에서 설치 후 테스트
4. 주요 점검 항목:
   - 로그인 (카카오 OAuth)
   - 지도 (카카오맵)
   - 카메라/사진 앨범
   - 푸시 알림
   - 딥링크 (`gotchaapp://`)

### 앱 스토어 정보 작성

1. **앱 정보**:
   - 앱 이름, 부제
   - 카테고리 (음식 및 음료 / 라이프스타일)
   - 앱 설명 (한국어)
   - 키워드
   - 지원 URL
   - 개인정보 처리방침 URL (필수)

2. **스크린샷** 업로드:
   - 6.7인치 (iPhone 15 Pro Max): **필수**
   - 6.5인치 (iPhone 11 Pro Max): 권장
   - 5.5인치 (iPhone 8 Plus): 선택

3. **빌드 선택**: TestFlight에서 확인된 빌드 연결

4. **앱 심사 정보**:
   - 연락처 정보
   - 로그인 필요 시 데모 계정 제공
   - 앱 심사에 대한 메모 (필요 시)

---

## 6. 심사 제출 체크리스트

### 필수 항목

- [ ] `npm run build:ios`로 배포 빌드 정상 동작 확인
- [ ] Xcode에서 Signing & Capabilities 설정 완료
- [ ] `PrivacyInfo.xcprivacy` 파일이 존재하고 Required Reason API가 명시되어 있는지 확인
- [ ] Archive 생성 + App Store Connect 업로드 성공 (ITMS-91053 경고 없음)
- [ ] TestFlight에서 주요 기능 테스트 완료
- [ ] 앱 스크린샷 업로드 (6.7인치 필수)
- [ ] 앱 설명, 키워드 등 메타데이터 작성
- [ ] 개인정보 처리방침 URL 등록
- [ ] 데모 계정 정보 제공 (로그인 필요 시)
- [ ] "심사를 위해 제출" 클릭

### 심사 시 주의사항

- **로그인 필요 앱**: 심사용 데모 계정/비밀번호를 반드시 제공
- **위치 권한**: Info.plist에 사용 이유 설명 필수 (완료)
- **푸시 알림**: Info.plist 설명 + entitlements 설정 (완료)
- **개인정보 처리방침**: App Store Connect에 URL 등록 필수
- **심사 기간**: 보통 24~48시간, 최초 제출 시 더 걸릴 수 있음

### 빌드 번호 관리

| 제출             | MARKETING_VERSION | CURRENT_PROJECT_VERSION |
| ---------------- | ----------------- | ----------------------- |
| 최초 출시        | 1.0               | 1                       |
| 버그 수정 재제출 | 1.0               | 2                       |
| 다음 업데이트    | 1.1               | 1 (리셋 가능)           |

> 같은 `MARKETING_VERSION`으로 재제출할 때는 `CURRENT_PROJECT_VERSION`을 증가시켜야 합니다.

---

## 관련 문서

- [Capacitor iOS 앱 래핑 구현 가이드](capacitor_ios_setup.md)
- [Capacitor 백엔드 요구사항](capacitor-backend-requirements.md)
