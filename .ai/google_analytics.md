# Google Analytics 연동 가이드

## 개요

GOTCHA 프로젝트는 Google Analytics 4 (GA4)를 사용하여 사용자 행동을 추적합니다.
Next.js의 `next/script`를 활용한 직접 gtag 스크립트 방식으로 구현되어 있습니다.

## 파일 구조

```
src/
├── components/analytics/
│   └── GoogleAnalytics.tsx    # GA 스크립트 컴포넌트
├── utils/
│   └── analytics.ts           # 이벤트 추적 함수
├── types/
│   └── gtag.d.ts              # gtag 타입 선언
└── app/
    └── layout.tsx             # GoogleAnalytics 컴포넌트 포함
```

## 환경 설정

### 로컬 개발

```bash
# .env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Vercel 배포

Vercel Dashboard → Settings → Environment Variables에서 설정:

- **Name**: `NEXT_PUBLIC_GA_ID`
- **Value**: `G-XXXXXXXXXX`

## 이벤트별 상세 분석

| 이벤트                 | 비즈니스 의미                | 분석 질문                                 | 핵심 공식                                         |
| ---------------------- | ---------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `user_login`           | 사용자 확보, 인증 선호도     | 카카오 vs 구글 비율? 신규 가입자 수?      | `신규가입률 = is_new_user=true / 전체 × 100`      |
| `shop_view`            | 콘텐츠 소비량, 인기 매장     | 가장 많이 조회되는 매장? 일평균 조회 수?  | `사용자당 조회 = 전체 shop_view / 고유 사용자`    |
| `favorite_toggle`      | 사용자 관심도, 재방문 의향   | 조회 대비 찜 전환율? 가장 많이 찜된 매장? | `찜 전환율 = is_favorite=true / shop_view × 100`  |
| `review_submit`        | UGC 기여도, 콘텐츠 품질      | 리뷰 작성 전환율? 이미지 포함 비율?       | `작성률 = review_submit / shop_view × 100`        |
| `shop_report_complete` | 플랫폼 콘텐츠 확장           | 제보 완료율? 일/주/월간 건수?             | `전환율 = complete / start × 100`                 |
| `map_search`           | 탐색 패턴, 지역 수요         | 인기 검색 지역? 검색 실패 키워드?         | `성공률 = result_count>0 / 전체 × 100`            |
| `location_permission`  | 핵심 기능 접근성             | 위치 권한 허용률? 거부 후 이탈률?         | `허용률 = granted=true / 전체 × 100` (목표: 70%+) |
| `share_click`          | 바이럴 가능성, 만족도        | 가장 많이 공유되는 매장? 공유 비율?       | `공유율 = share_click / shop_view × 100`          |
| `review_like`          | 콘텐츠 품질, 커뮤니티 활성도 | 인기 리뷰? 좋아요 취소 비율?              | `유지율 = (추가-취소) / 추가 × 100`               |
| `guest_mode_start`     | 비회원 규모, 전환 잠재력     | 게스트 비율? 회원 전환율?                 | `비율 = guest / (guest + login) × 100`            |
| `shop_report_start`    | 제보 기능 관심도             | 제보 진입 사용자 수?                      | 퍼널 진입점으로 활용                              |
| `shop_report_exit`     | UX 병목 지점 파악            | 어느 단계에서 이탈? 단계별 이탈률?        | `이탈률 = exit(step) / start × 100`               |

**활용 팁:**

- `map_search` 결과 없는 지역 → 신규 매장 제보 유도
- `location_permission` 허용률 낮으면 → 권한 요청 시점/문구 개선
- `guest_mode_start` 비율 높으면 → 회원 가입 유도 UI 개선

**제보 퍼널 분석:**

```
shop_report_start (100%)
    ↓ exit(step=location)
위치 선택 완료 (80%)
    ↓ exit(step=register)
shop_report_complete (50%)
```

| 이탈 단계 | 원인 추정        | 개선 방안                      |
| --------- | ---------------- | ------------------------------ |
| location  | 위치 선택 어려움 | 현재 위치 자동 감지, UI 간소화 |
| register  | 입력 항목 많음   | 필수 항목 최소화, 단계 분리    |

## GA4 대시보드 확인

### 실시간 확인

Google Analytics → 보고서 → 실시간 → 이벤트

### 이벤트 리포트

Google Analytics → 보고서 → 참여도 → 이벤트

## GA4 활용: 의미있는 통계 만들기

### 1. 전환 목표 설정

GA4 → 관리 → 이벤트 → 이벤트 수정/생성에서 "전환으로 표시"를 활성화합니다.

| 전환 목표   | 이벤트                          | 비즈니스 의미    |
| ----------- | ------------------------------- | ---------------- |
| 회원 가입   | `user_login` (is_new_user=true) | 신규 사용자 확보 |
| 콘텐츠 기여 | `review_submit`                 | 사용자 참여도    |
| 매장 제보   | `shop_report_complete`          | UGC 생산         |

### 2. 핵심 지표 (KPI) 대시보드

#### 사용자 확보

```
GA4 → 보고서 → 참여도 → 이벤트
필터: user_login
세분화: provider (카카오 vs 구글 로그인 비율)
```

#### 참여도 분석

```
GA4 → 보고서 → 참여도 → 이벤트
이벤트: favorite_toggle, review_submit, review_like
```

> 참여율 공식은 [이벤트별 상세 분석](#이벤트별-상세-분석) 표 참고

### 3. 퍼널 탐색 (제보 전환율)

GA4 → 탐색 → 새 탐색 만들기 → 유입경로 탐색

**단계 설정:**

1. `shop_report_start` (진입)
2. `shop_report_exit` 제외 필터 적용
3. `shop_report_complete` (완료)

> 퍼널 다이어그램은 [이벤트별 상세 분석 > 제보 퍼널 분석](#이벤트별-상세-분석) 참고

### 4. 사용자 세그먼트

GA4 → 관리 → 데이터 표시 → 세그먼트에서 생성

| 세그먼트      | 조건                                             | 활용                      |
| ------------- | ------------------------------------------------ | ------------------------- |
| 활성 사용자   | `favorite_toggle` OR `review_submit` 이벤트 발생 | 핵심 사용자 행동 분석     |
| 게스트 사용자 | `guest_mode_start` 이벤트 발생                   | 비회원 → 회원 전환 분석   |
| 공유 사용자   | `share_click` 이벤트 발생                        | 바이럴 가능성 높은 사용자 |

### 5. 탐색 보고서 예시

#### 인기 매장 분석

```
GA4 → 탐색 → 자유 형식
행: shop_name (이벤트 매개변수)
값: 이벤트 수
필터: 이벤트 = shop_view
```

#### 검색어 분석

```
GA4 → 탐색 → 자유 형식
행: query (이벤트 매개변수)
값: 이벤트 수
필터: 이벤트 = map_search
```

#### 위치 권한 허용률

```
GA4 → 탐색 → 자유 형식
행: granted (이벤트 매개변수)
값: 이벤트 수
필터: 이벤트 = location_permission
```

### 6. 주간/월간 리포트 지표

| 지표                   | 계산 방법                                         | 목표      |
| ---------------------- | ------------------------------------------------- | --------- |
| WAU (주간 활성 사용자) | 7일간 고유 사용자 수                              | 성장 추적 |
| 신규 가입률            | `user_login`(is_new_user=true) / 총 방문자        | 10% 이상  |
| 제보 전환율            | `shop_report_complete` / `shop_report_start`      | 50% 이상  |
| 리뷰 작성률            | `review_submit` / `shop_view`                     | 5% 이상   |
| 찜하기 비율            | `favorite_toggle`(is_favorite=true) / `shop_view` | 15% 이상  |
| 위치 권한 허용률       | `location_permission`(granted=true) / 총 요청     | 70% 이상  |

### 7. 알림 설정

GA4 → 관리 → 커스텀 정의 → 맞춤 알림

**추천 알림:**

- 일일 `user_login` 수가 평소 대비 50% 감소 시
- `shop_report_complete`가 0인 날
- `location_permission`(granted=false) 비율이 50% 초과 시

## 사용 방법

### 커스텀 이벤트 추가 방법

1. `src/utils/analytics.ts`에 타입 안전한 함수 추가:

```typescript
/** 새로운 이벤트 */
export const trackNewEvent = (param1: string, param2: number) => {
  if (typeof window.gtag === "undefined") return;
  window.gtag("event", "new_event", {
    param1,
    param2,
  });
};
```

2. 해당 컴포넌트에서 import하여 사용

```typescript
import { trackShopView, trackFavoriteToggle } from "@/utils/analytics";

// 매장 상세 페이지 조회
useEffect(() => {
  if (shop) {
    trackShopView(shop.id, shop.name);
  }
}, [shop?.id, shop?.name]);

// 찜하기 성공 시
const handleFavorite = async () => {
  const result = await toggleFavorite();
  trackFavoriteToggle(shopId, result.isFavorite);
};
```

## 주의사항

1. **SSR 호환**: 모든 이벤트 함수는 `typeof window.gtag === "undefined"` 체크 필수
2. **중복 방지**: useEffect 의존성 배열을 정확히 설정하여 중복 이벤트 방지
3. **개인정보**: 이벤트 파라미터에 개인정보(이메일, 전화번호 등) 포함 금지
4. **데이터 지연**: 이벤트 데이터는 GA4 대시보드에 24~48시간 후 표시됨 (실시간 제외)

## 관련 문서

- [Google Analytics 4 공식 문서](https://developers.google.com/analytics/devguides/collection/ga4)
- [gtag.js 이벤트 참조](https://developers.google.com/tag-platform/gtagjs/reference/events)
