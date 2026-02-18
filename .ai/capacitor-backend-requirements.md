# Capacitor iOS 앱 - 백엔드 요청사항

GOTCHA! iOS 네이티브 앱 출시를 위해 백엔드에서 작업이 필요한 항목입니다.

## 1. CORS 설정

Capacitor iOS 앱은 `capacitor://localhost` 오리진에서 API를 호출합니다.

**필요 작업:**

- CORS 허용 오리진에 `capacitor://localhost` 추가
- `Access-Control-Allow-Origin` 헤더에 해당 오리진 포함

## 2. 네이티브 푸시 알림 (APNS)

iOS 앱은 Web Push(VAPID) 대신 Apple Push Notification Service(APNS)를 사용합니다.

**필요 작업:**

- `POST /api/push/register-device` 엔드포인트 구현
  - 요청 body: `{ token: string, platform: "ios" | "android" }`
  - APNS 디바이스 토큰을 사용자 계정에 매핑하여 저장
- Apple Developer 계정에서 APNS 인증서(p8 키) 발급
- 서버에서 APNS를 통한 네이티브 푸시 전송 구현
  - 기존 Web Push와 병행하여, 사용자의 등록된 디바이스 유형에 따라 분기

## 3. OAuth 리디렉트 URI 등록

네이티브 앱은 커스텀 URL 스킴을 통해 OAuth 콜백을 처리합니다.

**필요 작업:**

- OAuth redirect_uri 허용 목록에 `gotchaapp://oauth/callback` 추가
- 각 OAuth 프로바이더(카카오, 네이버, 구글, 애플) 콘솔에서도 등록

## 4. Kakao Developer Console

카카오 맵 SDK 및 카카오 로그인이 Capacitor 환경에서 동작하려면:

**필요 작업:**

- Kakao Developer Console에서 `capacitor://localhost` 도메인 등록
- iOS 앱 번들 ID(`com.gotcha.it.app`) 등록

## 5. 우선순위

| 순서 | 항목                              | 중요도                     |
| ---- | --------------------------------- | -------------------------- |
| 1    | CORS `capacitor://localhost` 허용 | 필수 (앱 동작 불가)        |
| 2    | OAuth redirect_uri 등록           | 필수 (로그인 불가)         |
| 3    | Kakao 도메인 등록                 | 필수 (지도/로그인)         |
| 4    | APNS 푸시 구현                    | 중요 (App Store 심사 통과) |
