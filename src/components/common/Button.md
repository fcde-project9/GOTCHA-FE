# Button Component

GOTCHA 디자인 시스템을 따르는 공통 Button 컴포넌트입니다.

## 기본 사용법

```tsx
import { Button } from "@/components/common";

function MyComponent() {
  return <Button variant="primary">확인</Button>;
}
```

## Props

| Prop        | Type                                                | Default     | Description             |
| ----------- | --------------------------------------------------- | ----------- | ----------------------- |
| `variant`   | `"primary" \| "secondary" \| "tertiary" \| "ghost"` | `"primary"` | 버튼 스타일 variant     |
| `size`      | `"large" \| "medium" \| "small"`                    | `"medium"`  | 버튼 크기               |
| `fullWidth` | `boolean`                                           | `false`     | 전체 너비 사용 여부     |
| `disabled`  | `boolean`                                           | `false`     | 비활성화 상태           |
| `loading`   | `boolean`                                           | `false`     | 로딩 상태 (스피너 표시) |
| `className` | `string`                                            | -           | 추가 CSS 클래스         |
| `onClick`   | `(event: MouseEvent) => void`                       | -           | 클릭 이벤트 핸들러      |

_HTMLButtonElement의 모든 기본 props를 지원합니다._

## Variants

### Primary

메인 액션에 사용하는 기본 버튼입니다.

```tsx
<Button variant="primary">확인</Button>
```

- **배경**: Main 컬러 (#FF4545)
- **텍스트**: White
- **사용 예시**: 확인, 제출, 저장 등 주요 액션

### Secondary

보조 액션에 사용하는 버튼입니다.

```tsx
<Button variant="secondary">수정</Button>
```

- **배경**: Grey-900 (#121213)
- **텍스트**: White
- **사용 예시**: 수정, 설정, 보조 액션

### Tertiary

덜 중요한 액션에 사용하는 버튼입니다.

```tsx
<Button variant="tertiary">취소</Button>
```

- **배경**: Grey-100 (#EEEEEF)
- **텍스트**: Grey-900
- **사용 예시**: 취소, 닫기, 뒤로가기

### Ghost

텍스트 버튼으로 최소한의 스타일을 가집니다.

```tsx
<Button variant="ghost">삭제</Button>
```

- **배경**: Transparent
- **텍스트**: Grey-900
- **사용 예시**: 삭제, 건너뛰기, 옵션

## Sizes

```tsx
<Button size="large">Large Button</Button>
<Button size="medium">Medium Button</Button>
<Button size="small">Small Button</Button>
```

| Size     | Height | Padding           | Font Size |
| -------- | ------ | ----------------- | --------- |
| `large`  | 56px   | 24px (left/right) | 16px      |
| `medium` | 48px   | 20px (left/right) | 15px      |
| `small`  | 40px   | 16px (left/right) | 14px      |

## States

### Disabled

```tsx
<Button disabled>비활성화</Button>
```

버튼을 비활성화합니다. 클릭할 수 없으며 스타일이 회색으로 변경됩니다.

### Loading

```tsx
<Button loading>로딩 중</Button>
```

로딩 스피너를 표시하고 버튼을 비활성화합니다. 비동기 작업 중에 사용합니다.

## Layout

### Full Width

```tsx
<Button fullWidth>전체 너비 버튼</Button>
```

부모 요소의 전체 너비를 차지합니다.

## 사용 예시

### 폼 액션

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

### 액션 버튼 그룹

```tsx
function ActionButtons() {
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
function Navigation() {
  const router = useRouter();

  return (
    <div className="flex justify-between">
      <Button variant="tertiary" onClick={() => router.back()}>
        이전
      </Button>
      <Button variant="primary" onClick={() => router.push("/next")}>
        다음
      </Button>
    </div>
  );
}
```

### 커스텀 스타일링

```tsx
<Button variant="primary" className="shadow-lg rounded-full">
  커스텀 버튼
</Button>
```

`className` prop을 통해 추가 스타일을 적용할 수 있습니다. Tailwind utility classes를 사용하여 스타일을 확장할 수 있습니다.

## 접근성 (Accessibility)

- 키보드 포커스 지원 (Tab 키)
- Focus visible 링 표시
- Disabled 상태에서 자동으로 `cursor-not-allowed` 적용
- `aria-*` 속성 전달 가능

```tsx
<Button aria-label="프로필 수정" aria-describedby="edit-help-text">
  수정
</Button>
```

## 디자인 토큰

Button 컴포넌트는 `tailwind.config.ts`에 정의된 GOTCHA 디자인 시스템 컬러를 사용합니다:

- `main`: Primary 버튼 배경색
- `grey`: Secondary, Tertiary 버튼 및 텍스트
- `bg`: 배경색

## 주의사항

1. **inline style 사용 금지**: 모든 스타일은 Tailwind className을 통해 적용됩니다.
2. **variant 일관성**: 페이지 내에서 버튼의 계층 구조를 고려하여 variant를 선택하세요.
3. **로딩 상태**: 비동기 작업 시 `loading` prop을 사용하여 사용자에게 피드백을 제공하세요.
4. **접근성**: 아이콘만 있는 버튼의 경우 반드시 `aria-label`을 제공하세요.

## 개발 참고

- **예시 컴포넌트**: `Button.example.tsx` 파일에서 다양한 사용 예시를 확인할 수 있습니다.
- **타입 정의**: TypeScript를 통한 완전한 타입 지원
- **Ref 전달**: `forwardRef`를 통해 ref 전달 가능
