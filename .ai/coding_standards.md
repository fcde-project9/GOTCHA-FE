# Coding Standards (Frontend)

## 네이밍

- 함수/컴포넌트는 의도를 드러내는 완전한 단어 사용
- 축약 지양, 역할 중심 명명 (ex. `handleSubmit`, `refreshUserFromServer`)
- 타입/인터페이스는 구체적이고 의미 있는 필드명 사용

## TypeScript

- 공개 API/함수 시그니처는 명시적 타입 표기
- `any`/unsafe 캐스팅 지양
- 유틸/도메인 타입은 재사용 고려해 분리

## React

- 가드클로즈(early return) 선호, 깊은 중첩 지양
- 불필요한 try/catch 금지(의미 있는 처리 시에만)
- 상태/부수효과 최소화, 의존성 배열 엄격 관리
- 조건부 렌더링/로딩 상태는 명확히 표현
- pages 폴더에는 단독적인 url이 존재하는 컴포넌트
- components와 utils를 먼저 확인하고 재사용할 수 있는 코드는 재사용하기
- import할때는 최대한 절대경로 ('@') 사용

## 유틸 함수

- 2개 이상의 컴포넌트에서 사용되는 로직은 `src/utils/`에 공통 함수로 분리
- 유틸 함수는 단일 책임 원칙을 따르며, 명확한 JSDoc 주석 작성
- `src/utils/index.ts`에서 export하여 `@/utils`로 간편하게 import
- 예시: `openInstagramSupport()` - Instagram 문의하기 로직

## 공통 컴포넌트

### Button 사용법

버튼이 필요한 경우 `@/components/common`의 Button 컴포넌트를 사용하세요.

```tsx
import { Button } from "@/components/common";

// 기본 사용
<Button variant="primary">확인</Button>

// Variants: primary(메인액션), secondary(보조), tertiary(취소), ghost(최소)
<Button variant="secondary" size="large">수정</Button>

// Sizes: large(56px), medium(48px), small(40px)
<Button size="small">작은 버튼</Button>

// States: loading, disabled, fullWidth
<Button loading>처리 중...</Button>
<Button disabled>비활성화</Button>
<Button fullWidth>전체 너비</Button>
```

**테스트 페이지**: 개발 서버에서 `/button-test` 접속하여 모든 스타일 확인 가능  
**상세 문서**: `src/components/common/Button.md` 참고

### 아이콘

- 아이콘이 필요한 경우 `lucide-react`을 사용하세요.

## 라우팅/가드

- `ProtectedRoute`, `AdminRoute`는 세션 체크 지연 호출 패턴 유지
- 초기 렌더 리다이렉트 레이스컨디션 방지(loading 초기값 `!user`)
- Outlet 패턴을 사용하되, 필요 시 children 명시

## 데이터/요청

- TanStack Query는 서버 상태에만 사용, 로컬 UI 상태는 useState
- API 응답 타입은 `ApiResponse<T>` 형태 유지
- 에러 코드/메시지는 사용자 메시지와 개발자 로그를 분리

## 스타일/포맷

- 기존 포맷을 최대한 유지
- 라인 길이 과도 시 가독성을 최우선으로 개행
- 불필요한 주석/로그 삭제, 핵심 맥락만 주석
- CSS는 `tailwind.config.ts`에 정의된 디자인 시스템 변수 우선 사용
- inline style 대신 Tailwind className 사용
  - 배경색: `bg-default`, `bg-white`, `bg-grey` (GOTCHA 시스템)
  - 메인 컬러: `bg-main-500`, `text-main-700`
  - Grey 컬러: `bg-grey-900`, `text-grey-800`
  - Line 컬러: `border-line-100`, `border-line-300`
- 컬러/간격 등 반복 스타일은 `tailwind.config.ts`에 먼저 정의 후 활용

## 테스트/품질

- 타입/린트 에러 0 유지
- 위험 구간(인증/가드/리다이렉트)은 수동 테스트 체크리스트 운영
