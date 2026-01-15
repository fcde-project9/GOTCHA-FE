# 모달 및 권한 요청 표준

## 모달 (Modal) 표준

### 모달 동작 요구사항

#### 1. Focus Trap (포커스 트랩)

- 모달이 열리면 포커스가 모달 내부로 이동
- Tab/Shift+Tab으로 모달 내부 요소만 순환
- 모달 외부 요소는 포커스 불가
- 첫 번째 포커스 가능한 요소에 자동 포커스 (일반적으로 닫기 버튼 또는 주요 액션 버튼)

#### 2. Overlay/Backdrop 상호작용

- 오버레이 클릭 시 모달 닫기 (dismissible modal)
- 중요한 액션(결제, 삭제 등)은 오버레이 클릭으로 닫히지 않도록 설정 가능
- 오버레이 배경색: `bg-black/50` (50% 투명도)
- z-index: `z-50` (모달), `z-40` (오버레이)

#### 3. 접근성 (Accessibility)

- ESC 키로 모달 닫기 지원
- `role="dialog"` 또는 `role="alertdialog"` 속성
- `aria-labelledby` (제목 ID 참조)
- `aria-describedby` (설명 ID 참조, 선택사항)
- 닫기 버튼에 `aria-label="닫기"` 추가
- 모달이 열리면 body 스크롤 방지

#### 4. 애니메이션

- 페이드 인/아웃: `transition-opacity duration-200`
- 슬라이드 업(바텀시트): `transition-transform duration-300`
- 모달이 닫힐 때 애니메이션 완료 후 DOM에서 제거

### 모달 구현 체크리스트

```typescript
// ✅ 필수 구현 사항
interface ModalProps {
  isOpen: boolean;              // 모달 열림 상태
  onClose: () => void;          // 닫기 핸들러
  title?: string;               // 접근성을 위한 제목
  dismissible?: boolean;        // 오버레이 클릭으로 닫기 가능 여부 (기본: true)
}

// ✅ 구현 예시
export function ExampleModal({ isOpen, onClose, title, dismissible = true }: ModalProps) {
  // ESC 키 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <div
        role="dialog"
        aria-labelledby={title ? "modal-title" : undefined}
        className="relative z-10 mx-5 w-full max-w-[340px] rounded-2xl bg-white p-6"
      >
        {/* 닫기 버튼 */}
        <button onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>

        {/* 컨텐츠 */}
        {title && <h2 id="modal-title">{title}</h2>}
        {/* ... */}
      </div>
    </div>
  );
}
```

## 권한 요청 (Permission Request) 가이드라인

### 1. 표준화된 메시지 (Standardized Copy)

#### 위치 권한 (Location Permission)

```typescript
// ✅ 권장 메시지
const LOCATION_PERMISSION_MESSAGES = {
  title: "위치 권한이 필요해요",
  description: "내 주변 매장을 찾기 위해\n위치 권한이 필요합니다.",
  primaryAction: "위치 권한 허용하기",
  secondaryAction: "나중에",
  deniedTitle: "📍 설정 방법",
  deniedDescription: "브라우저 설정에서 위치 권한을 허용해주세요.",
};

// ❌ 피해야 할 표현
// - "위치 정보를 수집합니다" (불안감 유발)
// - "필수입니다" (강제성)
// - 기술 용어 (Geolocation API, GPS 등)
```

#### 알림 권한 (Notification Permission)

```typescript
const NOTIFICATION_PERMISSION_MESSAGES = {
  title: "알림을 받아보세요",
  description: "새로운 매장 정보와 이벤트 소식을\n가장 먼저 받아보세요.",
  primaryAction: "알림 받기",
  secondaryAction: "나중에",
};
```

### 2. 권한 요청 타이밍

#### ✅ 좋은 타이밍

- 사용자가 해당 기능을 사용하려고 할 때 (Just-in-time)
- 기능의 가치를 이해한 후
- 예: "현재 위치" 버튼 클릭 시 → 위치 권한 요청

#### ❌ 나쁜 타이밍

- 앱 첫 실행 시 즉시 요청
- 사용자가 요청하지 않은 기능에 대한 권한
- 연속적인 여러 권한 요청

### 3. 동의 로깅 형식 (Consent Logging Format)

```typescript
// 권한 요청 로그 타입
interface PermissionRequestLog {
  timestamp: string; // ISO 8601 형식
  permissionType: string; // "location" | "notification" | "camera" 등
  action: string; // "granted" | "denied" | "dismissed"
  trigger: string; // "user_action" | "auto_prompt"
  context?: string; // 요청이 발생한 페이지/기능
}

// 로깅 예시
const logPermissionRequest = (log: PermissionRequestLog) => {
  console.log("[Permission Request]", {
    timestamp: new Date().toISOString(),
    permissionType: "location",
    action: "granted",
    trigger: "user_action",
    context: "/home",
  });

  // 분석 도구로 전송 (선택사항)
  // analytics.track("permission_request", log);
};
```

### 4. 텔레메트리/추적 필드 (Telemetry/Tracking Fields)

```typescript
interface PermissionTelemetry {
  // 필수 필드
  userId?: string; // 사용자 ID (로그인 시)
  sessionId: string; // 세션 ID
  timestamp: string; // 요청 시각
  permissionType: string; // 권한 유형

  // 상태 필드
  previousState: PermissionState; // 이전 권한 상태
  currentState: PermissionState; // 현재 권한 상태

  // 컨텍스트 필드
  page: string; // 현재 페이지 경로
  feature: string; // 요청한 기능명
  trigger: "user_click" | "auto"; // 트리거 방식

  // 브라우저 정보
  browser: string; // 브라우저 종류
  platform: string; // OS/플랫폼

  // 결과 필드
  result: "granted" | "denied" | "dismissed" | "error";
  errorCode?: string; // 에러 발생 시
}
```

### 5. QA 체크리스트

#### 위치 권한 모달 테스트

- [ ] 모달이 열릴 때 포커스가 모달 내부로 이동
- [ ] ESC 키로 모달 닫기
- [ ] 오버레이 클릭으로 모달 닫기
- [ ] "위치 권한 허용하기" 버튼 클릭 시 브라우저 권한 프롬프트 표시
- [ ] 권한 허용 시 모달 자동 닫기
- [ ] 권한 거부 시 설정 안내 박스 표시
- [ ] 설정 안내 메시지가 브라우저별로 적절히 표시 (Chrome, Safari, Firefox)
- [ ] Permissions API 미지원 환경에서도 정상 동작
- [ ] Geolocation API 미지원 환경에서 적절한 에러 메시지
- [ ] 로딩 상태 표시 ("확인 중...")
- [ ] 모달이 열려있을 때 body 스크롤 방지

#### 접근성 테스트

- [ ] 스크린 리더로 모달 제목/내용 읽기
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 포커스 순서가 논리적
- [ ] 닫기 버튼에 적절한 aria-label

#### 크로스 브라우저 테스트

- [ ] Chrome (Desktop/Mobile)
- [ ] Safari (Desktop/Mobile)
- [ ] Firefox
- [ ] Edge

## LocationPermissionModal 구현 준수 사항

`LocationPermissionModal` 컴포넌트는 위의 모든 표준을 준수합니다:

### ✅ 준수 항목

1. **Focus Management**: ESC 키로 모달 닫기 지원
2. **Overlay Handling**: 오버레이 클릭으로 모달 닫기 (`dismissible` 기본값: true)
3. **Accessibility**:
   - `role="dialog"` 속성 없음 (추가 필요)
   - 닫기 버튼에 `aria-label="닫기"` 추가됨
   - Body 스크롤 방지 없음 (추가 필요)
4. **Standardized Copy**: 표준 메시지 사용
5. **Permission State Handling**: Permissions API 및 Geolocation API 미지원 환경 대응
6. **Browser-specific Guidance**: 브라우저별 설정 안내 제공

### 🔧 개선 필요 항목

1. Body 스크롤 방지 추가
2. `role="dialog"` 속성 추가
3. `aria-labelledby` 속성 추가
4. 권한 요청 로깅 추가 (선택사항)

### 참조

- 컴포넌트: `src/components/common/LocationPermissionModal.tsx`
- 사용 예시: `src/app/home/page.tsx` (현재 위치 버튼 클릭 시)
