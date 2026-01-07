# Button Component 추가 완료 ✅

Figma 디자인 시스템을 기반으로 공통 Button 컴포넌트를 생성했습니다.

## 생성된 파일들

```text
src/
├── components/
│   └── common/
│       ├── Button.tsx           # 메인 Button 컴포넌트
│       ├── Button.example.tsx   # 사용 예시 컴포넌트
│       ├── Button.md            # 상세 문서
│       └── index.ts             # Export 추가
└── app/
    └── button-test/
        └── page.tsx             # 테스트 페이지
```

## 빠른 시작

### 1. Import

```tsx
import { Button } from "@/components/common";
```

### 2. 기본 사용

```tsx
<Button variant="primary" size="medium">
  확인
</Button>
```

### 3. 다양한 Variant

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="ghost">Ghost</Button>
```

### 4. 크기 조절

```tsx
<Button size="large">Large</Button>
<Button size="medium">Medium</Button>
<Button size="small">Small</Button>
```

### 5. 상태 관리

```tsx
<Button disabled>비활성화</Button>
<Button loading>로딩 중</Button>
<Button fullWidth>전체 너비</Button>
```

## 주요 기능

### ✅ Figma 디자인 시스템 완벽 구현

- Primary, Secondary, Tertiary, Ghost 4가지 variant
- Large (56px), Medium (48px), Small (40px) 3가지 size
- Hover, Active, Disabled, Loading 상태 지원

### ✅ Tailwind CSS 기반

- `tailwind.config.ts`에 정의된 GOTCHA 디자인 시스템 컬러 사용
- inline style 없음, 모든 스타일은 className으로 관리
- `cn()` 유틸리티로 클래스 병합 및 확장 가능

### ✅ TypeScript 완벽 지원

- 모든 Props 타입 정의
- ButtonVariant, ButtonSize 등 타입 export
- HTMLButtonElement의 모든 기본 props 상속

### ✅ 접근성 (Accessibility)

- 키보드 포커스 지원
- Focus-visible 링 표시
- ARIA 속성 전달 가능
- Disabled 상태 커서 처리

### ✅ 개발자 경험

- forwardRef로 ref 전달 가능
- JSDoc 주석으로 IDE 자동완성 지원
- 명확한 prop 기본값
- 상세한 문서화

## 테스트 방법

### 개발 서버에서 확인

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/button-test` 접속

이 페이지에서 다음을 확인할 수 있습니다:

- 모든 variant와 size 조합
- 각 상태별 스타일
- Interactive 예시
- 실제 사용 케이스

## 실제 사용 예시

### 로그인 폼

```tsx
function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await loginAPI();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button variant="primary" size="large" fullWidth loading={loading} onClick={handleSubmit}>
        로그인
      </Button>
      <Button variant="tertiary" size="large" fullWidth>
        취소
      </Button>
    </div>
  );
}
```

### 액션 버튼

```tsx
function ShopCard() {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="small">
        수정
      </Button>
      <Button variant="ghost" size="small">
        삭제
      </Button>
    </div>
  );
}
```

### 네비게이션

```tsx
function StepNavigation() {
  return (
    <div className="flex justify-between">
      <Button variant="tertiary" onClick={onPrev}>
        이전
      </Button>
      <Button variant="primary" onClick={onNext}>
        다음
      </Button>
    </div>
  );
}
```

## 디자인 토큰

### Colors (from tailwind.config.ts)

| 용도            | Variant   | Color Token               |
| --------------- | --------- | ------------------------- |
| Primary 배경    | Primary   | `bg-main` (#FF4545)       |
| Primary Hover   | Primary   | `bg-main-700` (#F43329)   |
| Primary Active  | Primary   | `bg-main-900` (#D61D1B)   |
| Secondary 배경  | Secondary | `bg-grey-900` (#121213)   |
| Secondary Hover | Secondary | `bg-grey-800` (#323233)   |
| Tertiary 배경   | Tertiary  | `bg-grey-100` (#EEEEEF)   |
| Tertiary Hover  | Tertiary  | `bg-grey-200` (#E2E2E3)   |
| Disabled 배경   | All       | `bg-grey-300` (#CCCCCD)   |
| Disabled 텍스트 | All       | `text-grey-500` (#8A8A8B) |

### Sizes

| Size   | Height | Padding (X) | Font Size |
| ------ | ------ | ----------- | --------- |
| Large  | 56px   | 24px        | 16px      |
| Medium | 48px   | 20px        | 15px      |
| Small  | 40px   | 16px        | 14px      |

## Props API

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "large" | "medium" | "small";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}
```

## 코딩 스타일 준수

이 컴포넌트는 `.ai/coding_standards.md`의 모든 규칙을 따릅니다:

✅ Tailwind className 사용 (inline style 없음)  
✅ `tailwind.config.ts` 디자인 토큰 활용  
✅ TypeScript 명시적 타입 표기  
✅ Early return 패턴 (가드클로즈)  
✅ 의미있는 변수명  
✅ 재사용 가능한 컴포넌트 구조  
✅ 절대경로 import (`@/...`)  
✅ 린트 에러 0

## 다음 단계

### 추가로 만들면 좋은 공통 컴포넌트

1. **Input** - 텍스트 입력 필드
2. **Select** - 드롭다운 선택
3. **Checkbox / Radio** - 선택 컨트롤
4. **Modal** - 모달 다이얼로그
5. **Toast** - 알림 메시지
6. **Card** - 카드 레이아웃
7. **Badge** - 뱃지/태그

### 개선 제안

1. **아이콘 지원**: Button에 leading/trailing 아이콘 추가
2. **Button Group**: 여러 버튼을 그룹으로 묶는 컴포넌트
3. **Icon Button**: 아이콘만 있는 버튼 variant
4. **Link Button**: Next.js Link와 통합된 버튼

## 문서

- **상세 문서**: `src/components/common/Button.md`
- **예시 코드**: `src/components/common/Button.example.tsx`
- **테스트 페이지**: `/button-test` (개발 환경)

## 참고

- Figma 디자인: https://www.figma.com/design/cQ0OguMu2o7IO6arckxDtU/GOTCHA--디자인?node-id=636-5575
- Tailwind Config: `tailwind.config.ts`
- Coding Standards: `.ai/coding_standards.md`
