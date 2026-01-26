# SEO (검색 엔진 최적화) 가이드

## 개요

이 문서는 GOTCHA! 프로젝트의 SEO 설정과 Google Search Console 색인 문제 해결 방법을 설명합니다.

---

## SEO 기능별 효과

### 1. 동적 메타데이터 (`generateMetadata`)

**효과:**

- **검색 결과 클릭률(CTR) 향상**: 가게명과 정보가 검색 결과에 직접 표시
- **검색 노출 증가**: 각 가게별로 고유한 title/description으로 다양한 키워드에 노출

```
Before: "GOTCHA! - 가챠샵 지도 서비스" (모든 가게 페이지 동일)
After:  "가챠샵 홍대점 - 위치, 영업시간, 리뷰 | GOTCHA!" (가게별 고유)
```

### 2. JSON-LD 구조화된 데이터

**효과:**

- **리치 스니펫 표시**: Google 검색 결과에 별점, 리뷰 수, 영업 상태 등 추가 정보 표시
- **지도/로컬 검색 노출**: "내 근처 가챠샵" 검색 시 Google 지도에 표시될 가능성 증가
- **음성 검색 최적화**: Google Assistant 등 음성 검색 결과에 선택될 확률 증가

```
일반 검색 결과:
  가챠샵 홍대점 | GOTCHA!
  https://gotcha.com/shop/123

리치 스니펫 적용 후:
  가챠샵 홍대점 | GOTCHA!
  ⭐ 리뷰 23개 · 서울 마포구 · 영업 중
  https://gotcha.com/shop/123
```

### 3. 서버 사이드 리디렉션

**효과:**

- **색인 문제 해결**: "리디렉션이 포함된 페이지" 경고 제거
- **크롤링 효율성**: Google 봇이 JavaScript 실행 없이 즉시 콘텐츠 접근
- **페이지 속도 점수 향상**: 불필요한 클라이언트 리디렉션 제거

### 4. sitemap.xml

**효과:**

- **색인 속도 향상**: 새 가게 페이지가 더 빠르게 Google에 색인됨
- **크롤링 우선순위 전달**: priority 값으로 중요한 페이지 우선 크롤링 유도
- **페이지 발견**: 링크가 없는 페이지도 크롤러가 발견 가능

### 5. robots.txt

**효과:**

- **크롤링 효율화**: 불필요한 페이지(API, OAuth) 크롤링 방지
- **크롤링 예산 절약**: 중요한 페이지에 크롤링 리소스 집중
- **보안**: 민감한 경로 노출 방지

### 6. canonical URL

**효과:**

- **중복 콘텐츠 방지**: 같은 콘텐츠의 여러 URL이 있을 때 대표 URL 지정
- **페이지 권한 집중**: 여러 URL의 SEO 점수가 하나로 통합됨

---

## 예상 결과

| 지표             | 개선 전          | 개선 후 (예상)                             |
| ---------------- | ---------------- | ------------------------------------------ |
| 색인된 페이지    | 정적 페이지만    | 모든 가게 페이지                           |
| 검색 노출 키워드 | "가챠샵" 등 일반 | "홍대 가챠샵", "강남역 캡슐토이" 등 구체적 |
| 검색 결과 클릭률 | 기본             | 리치 스니펫으로 2-3배 향상 가능            |
| Google 지도 노출 | 없음             | LocalBusiness 스키마로 노출 가능           |

### 검색 결과 변화 예시

```
Before: "가챠샵" 검색 → 메인 페이지만 노출
After:  "홍대 가챠샵" 검색 → 해당 가게 페이지 직접 노출
        + 리치 스니펫으로 리뷰 수, 위치 정보 표시
```

**Google 검색 결과 비교:**

```
[개선 전]
GOTCHA! - 가챠샵 지도 서비스
https://gotcha.com
가챠샵을 지도 기반으로 탐색하고 매장 정보를 확인할 수 있는 모바일 웹 서비스

[개선 후]
가챠샵 홍대점 - 위치, 영업시간, 리뷰 | GOTCHA!
https://gotcha.com/shop/123
⭐ 리뷰 23개 · 서울 마포구 홍대입구역 · 영업 중
```

---

## 파일 구조

```
src/
├── app/
│   ├── robots.ts          # 크롤러 접근 규칙
│   ├── sitemap.ts         # 사이트맵 생성 (동적)
│   ├── layout.tsx         # 전역 메타데이터
│   ├── page.tsx           # 루트 페이지 (서버 리디렉션)
│   ├── home/
│   │   ├── layout.tsx     # /home 페이지 메타데이터
│   │   └── page.tsx       # 메인 콘텐츠 + 스플래시
│   └── shop/[id]/
│       ├── layout.tsx     # 동적 메타데이터 + JSON-LD
│       └── page.tsx       # 가게 상세 페이지
├── middleware.ts          # 서버 사이드 리디렉션
└── components/common/
    └── SplashScreen.tsx   # 스플래시 스크린 컴포넌트
```

---

## robots.txt vs sitemap.xml

| 구분          | robots.txt                             | sitemap.xml                            |
| ------------- | -------------------------------------- | -------------------------------------- |
| **역할**      | 크롤러에게 "어디를 크롤링하지 마" 지시 | 크롤러에게 "이런 페이지들이 있어" 알림 |
| **비유**      | 건물의 "출입금지" 표지판               | 건물의 층별 안내도                     |
| **필수 여부** | 권장 (없으면 전체 허용)                | 권장 (SEO 향상)                        |
| **내용**      | 차단할 경로, sitemap 위치              | 모든 페이지 URL, 수정일, 우선순위      |

### Next.js에서 동적 생성

Next.js App Router에서는 `.ts` 파일로 동적 생성이 가능합니다:

- `robots.ts` → 빌드 시 `/robots.txt` 생성
- `sitemap.ts` → 빌드 시 `/sitemap.xml` 생성

**장점**: 새 페이지 추가 시 코드만 수정하면 자동 반영

---

## 현재 설정

### 1. robots.ts (`src/app/robots.ts`)

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API 경로 차단
          "/oauth/", // OAuth 콜백 차단
          "/button-test/", // 테스트 페이지 차단
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

### 2. sitemap.ts (`src/app/sitemap.ts`)

정적 페이지 + 동적 가게 페이지를 sitemap에 포함:

- `/` (priority: 1.0)
- `/home` (priority: 0.9)
- `/shop/{id}` (priority: 0.8) - 백엔드 API 연동 시 자동 추가
- `/login`, `/favorites`, `/mypage` 등

### 3. 서버 사이드 리디렉션

**문제**: 기존 `/` 페이지가 클라이언트 JavaScript로 리디렉션 → Google 크롤러가 "리디렉션이 포함된 페이지"로 인식

**해결**:

- `middleware.ts`: 서버에서 `/` → `/home` 308 리디렉션
- `page.tsx`: 서버 컴포넌트로 `redirect()` 사용

### 4. 가게 상세 페이지 동적 메타데이터 (`src/app/shop/[id]/layout.tsx`)

각 가게 페이지에 동적으로 메타데이터 생성:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const shop = await getShopDetail(shopId);
  return {
    title: `${shop.name} - 위치, 영업시간, 리뷰`,
    description: `${shop.addressName}. ${shop.openStatus}. 리뷰 ${shop.reviewCount}개.`,
    openGraph: { ... },
  };
}
```

### 5. JSON-LD 구조화된 데이터 (LocalBusiness 스키마)

Google 검색 결과에서 리치 스니펫 표시를 위한 구조화된 데이터:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "가챠샵 홍대점",
  "address": { "@type": "PostalAddress", ... },
  "geo": { "@type": "GeoCoordinates", "latitude": 37.5, "longitude": 127.0 },
  "aggregateRating": { "@type": "AggregateRating", "reviewCount": 23 }
}
```

---

## Google Search Console 문제 해결

### "리디렉션이 포함된 페이지" 문제

**원인**: 클라이언트 사이드 리디렉션 (JavaScript)
**해결**: 서버 사이드 리디렉션으로 변경 완료

### "크롤링됨 - 현재 색인이 생성되지 않음" 문제

**가능한 원인**:

1. 콘텐츠 부족 - 페이지에 유의미한 텍스트 콘텐츠 필요
2. 중복 콘텐츠 - canonical URL 설정 필요
3. noindex 설정 - robots 메타태그 확인

**해결**:

- 각 페이지에 적절한 메타데이터 설정 (`title`, `description`)
- `canonical` URL 설정으로 중복 방지
- `layout.tsx`에 `robots: { index: true, follow: true }` 확인

---

## 추가 작업 체크리스트

- [ ] Google Search Console 인증 코드 추가 (`layout.tsx` 142번째 줄)
- [x] 가게 상세 페이지 동적 메타데이터 추가
- [x] JSON-LD 구조화된 데이터 추가
- [ ] 동적 sitemap에 가게 페이지 추가 (백엔드 API 필요: `GET /api/shops/all`)
- [ ] Open Graph 이미지 (`/images/og-image.png`) 1200x630 크기로 준비
- [ ] 배포 후 Google Search Console에서 색인 요청
- [ ] 네이버 서치어드바이저 등록 (선택)

---

## 백엔드 API 요청사항

sitemap에 모든 가게 페이지를 추가하려면 다음 API가 필요합니다:

```
GET /api/shops/all
Response: {
  "success": true,
  "data": [
    { "id": 1, "updatedAt": "2024-01-01T00:00:00Z" },
    { "id": 2, "updatedAt": "2024-01-02T00:00:00Z" },
    ...
  ]
}
```

---

## 색인 요청 방법

1. [Google Search Console](https://search.google.com/search-console) 접속
2. URL 검사 도구에서 URL 입력
3. "색인 생성 요청" 클릭
4. sitemap 제출: 사이트맵 메뉴에서 `/sitemap.xml` 제출

---

## 참고 자료

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js robots.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js sitemap.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google 구조화된 데이터](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness)
- [Google Search Console 도움말](https://support.google.com/webmasters)
