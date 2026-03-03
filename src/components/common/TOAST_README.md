# Toast System

## 구조

```text
src/
├── components/common/Toast.tsx   # UI 컴포넌트
├── hooks/useToast.tsx            # Context Provider + Hook
public/images/icons/
├── toast-check.svg               # 성공 아이콘
├── toast-warning.svg             # 경고 아이콘
```

## 사용법

### 기본 (성공)

```tsx
const { showToast } = useToast();

showToast("저장되었어요");
```

### 경고 (옵션 객체 방식 - 권장)

```tsx
showToast("로그인이 필요합니다.", { variant: "warning" });
```

### 커스텀 duration

```tsx
// 옵션 객체 방식
showToast("잠시만 기다려주세요", { duration: 3000 });

// 숫자 방식 (하위 호환)
showToast("잠시만 기다려주세요", 3000);
```

### 액션 버튼 포함

```tsx
// 옵션 객체 방식
showToast("차단이 해제되었어요", {
  duration: 3000,
  action: { label: "취소", onPress: () => handleUndo() },
});

// 숫자 + 액션 방식 (하위 호환)
showToast("차단이 해제되었어요", 3000, {
  label: "취소",
  onPress: () => handleUndo(),
});
```

## API

### `showToast(message, durationOrOptions?, action?, variant?)`

| 파라미터            | 타입                         | 기본값      | 설명                         |
| ------------------- | ---------------------------- | ----------- | ---------------------------- |
| `message`           | `string`                     | -           | 토스트 메시지 (필수)         |
| `durationOrOptions` | `number \| ShowToastOptions` | `2000`      | 표시 시간(ms) 또는 옵션 객체 |
| `action`            | `ToastAction`                | -           | 액션 버튼 (하위 호환용)      |
| `variant`           | `ToastVariant`               | `"success"` | 토스트 종류 (하위 호환용)    |

### `ShowToastOptions`

```ts
interface ShowToastOptions {
  duration?: number; // 표시 시간 (기본: 2000ms)
  variant?: ToastVariant; // "success" | "warning"
  action?: ToastAction; // { label: string, onPress: () => void }
}
```

## Variant

| Variant          | 아이콘            | 용도                                      |
| ---------------- | ----------------- | ----------------------------------------- |
| `success` (기본) | toast-check.svg   | 정상 처리 (저장, 변경, 완료 등)           |
| `warning`        | toast-warning.svg | 실패, 에러, 경고 (API 오류, 권한 부족 등) |

## 디자인 스펙

- **크기**: 345 x 53px
- **위치**: 화면 상단 (`top: 48px`), 수평 중앙
- **배경**: `grey-900`, `rounded-[10px]`
- **애니메이션**: 위에서 아래로 슬라이드 (700ms, ease-out)
- **표시 시간**: 기본 2000ms (사라지는 애니메이션 700ms 추가)
- **액션 버튼 색상**: `#7dcfff`
- **z-index**: 50

## 규칙

- API 통신 성공 → `showToast("메시지")` (기본 success)
- API 통신 실패 / 에러 → `showToast("메시지", { variant: "warning" })`
- 옵션 객체 방식 사용 권장 (`{ variant, duration, action }`)
