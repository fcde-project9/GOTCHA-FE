---
description: iOS 앱스토어 심사 제출 준비 - main에서 release 브랜치 분기, 사전 점검, 누락 패치, 버전 bump, 릴리스 노트 초안, PR 작성까지 (Archive는 Xcode에서 수동)
allowed-tools: Bash, Read, Edit, Write
argument-hint: "[선택] 새 버전 — 예: '2.1' 또는 '2.0+2' (마케팅+빌드)"
---

iOS 앱스토어 새 빌드 제출용 release 브랜치 워크플로우. **main 기준**으로 동작합니다 (dev → main 머지가 끝난 상태 전제).
푸시/PR은 사용자 명시 승인 후에만 진행.

사용자 인자: $ARGUMENTS (없으면 4단계에서 질문)

## 절차

### 1. 환경 확인 (병렬 실행)

다음을 **단일 메시지에서 병렬로** 실행:

- `git status` (`-uall` 금지)
- `git branch --show-current`
- `git log -1 --format=%H`
- `git fetch origin main`
- `git log HEAD..origin/main --oneline` (로컬 main 뒤처져 있나)
- `git log origin/main..origin/dev --oneline` (dev에 main 대비 미머지 커밋 있나)
- `cat .nvmrc 2>/dev/null` (요구 Node 버전)
- `node -v` (현재 Node)

### 2. main 동기화 + dev 머지 확인

**현재 브랜치가 main이 아니면**:

- 변경사항 없으면 `git checkout main && git pull origin main`
- 변경사항 있으면 사용자에게 보고 후 진행 방향 협의 (stash / 새 브랜치)

**dev에 main 대비 미머지 커밋이 있으면**:

- 사용자에게 알리고 "dev → main PR 먼저 머지해야 합니다" 안내 후 중단
- 진행 강행할지 사용자에게 확인

**Node 버전이 `.nvmrc`와 다르면**:

- `source "$HOME/.nvm/nvm.sh" && nvm use $(cat .nvmrc)`로 전환 안내 (이후 모든 Bash 호출 앞에 source+use 동봉)

### 3. 사전 점검 (병렬 실행)

다음을 한 메시지에서 병렬로 실행 후 결과를 표로 정리:

1. **Sentry DSN 환경변수**
   - `grep -E "^NEXT_PUBLIC_SENTRY_DSN=" .env.local` (값 있어야 함)
   - `grep -E "^NEXT_PUBLIC_SENTRY_DSN=" .env.capacitor` (placeholder라도 있어야 함)
   - `ls instrumentation-client.ts sentry.server.config.ts` (Sentry init 파일 존재)

2. **Info.plist 권한 description**
   - `grep -A1 "UsageDescription" ios/App/App/Info.plist`
   - 필수: `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription`

3. **Privacy Manifest** (Apple 2024.5+ 필수)
   - `ls ios/App/App/PrivacyInfo.xcprivacy`
   - 존재하면 `plutil -lint ios/App/App/PrivacyInfo.xcprivacy`
   - Xcode 등록 여부: `grep "PrivacyInfo.xcprivacy" ios/App/App.xcodeproj/project.pbxproj`

4. **Capacitor SPM 플러그인 정합성**
   - `grep -c "package: \"" ios/App/CapApp-SPM/Package.swift`
   - `node -e "const p=require('./package.json'); console.log(Object.keys(p.dependencies).filter(d => d.startsWith('@capacitor/') || d === '@sentry/capacitor').length)"`
   - 두 숫자가 일치해야 함. 불일치 시 `npx cap update ios` 필요

5. **빌드 스크립트의 Sentry release 태깅**
   - `grep "SENTRY_RELEASE" scripts/build-ios.sh`
   - 없으면 누락

6. **현재 iOS 버전 확인**
   - `grep -m1 "MARKETING_VERSION\|CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj`

### 4. 이슈 보고 + 결정 요청

사전 점검 결과를 사용자에게 다음 형식으로 보고:

```text
## ✅ 통과
- ...

## ⚠️ 패치 필요
🔴 (필수) <항목>
🟡 (권장) <항목>

## 결정 필요
1. 버전 bump: <현재 X.Y, build N> → ?
   A) <X.Y 유지> + build N+1 (마이너 패치)
   B) <X.(Y+1)> + build 1 (신기능 포함)
2. 패치 자동 적용할까요? (Y/N)
```

`$ARGUMENTS`로 버전이 명시되어 있으면 그것 사용 (예: "2.1" → MARKETING 2.1/build 1, "2.0+2" → 2.0/build 2).

**사용자 응답 대기**.

### 5. 패치 자동 적용 (승인 받은 경우만)

각 누락 항목에 대해 다음 절차:

#### 5-1. Privacy Manifest 누락 시

- `ios/App/App/PrivacyInfo.xcprivacy` 생성 (Sentry + 표준 권한 데이터타입 + Required Reason API)
- 표준 템플릿:
  - `NSPrivacyTracking: false`, `NSPrivacyTrackingDomains: []`
  - 수집 데이터타입: 이메일/이름/UserID/콘텐츠/사진/위치(정확+대략) — App Functionality, Linked
  - 크래시/성능/진단 (Sentry) — App Functionality + Analytics, Unlinked
  - Required Reason API: FileTimestamp(C617.1) / UserDefaults(CA92.1) / DiskSpace(E174.1) / SystemBootTime(35F9.1)
- `ios/App/App.xcodeproj/project.pbxproj`에 4곳 추가 (PBXBuildFile, PBXFileReference, PBXGroup children, PBXResourcesBuildPhase files)
- 사용 UUID 예시: `7E5E5E5E2F470000ACE0A001` (FileReference), `7E5E5E5E2F470000ACE0A002` (BuildFile) — 충돌 안 나는 24-hex
- `plutil -lint`로 검증

#### 5-2. `.env.capacitor`에 Sentry 키 누락 시

파일 끝에 추가 (placeholder, 실제 값은 `.env.local`에 둠):

```text
# Sentry (Capacitor 빌드에서도 동일 DSN 사용. 미설정 시 에러 모니터링 비활성)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

#### 5-3. `build-ios.sh`에 Sentry release 태깅 없을 시

sed/Edit으로 `next build` 직전에 다음 블록 삽입:

```bash
MARKETING_VERSION=$(grep -m1 "MARKETING_VERSION" ios/App/App.xcodeproj/project.pbxproj | sed -E 's/.*= *([^;]+);.*/\1/')
BUILD_NUMBER=$(grep -m1 "CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj | sed -E 's/.*= *([^;]+);.*/\1/')
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
SENTRY_RELEASE="ios@${MARKETING_VERSION}+${BUILD_NUMBER}.${GIT_SHA}"
echo "▶ Sentry release: ${SENTRY_RELEASE}"
```

빌드 명령에 `NEXT_PUBLIC_SENTRY_RELEASE="${SENTRY_RELEASE}" SENTRY_RELEASE="${SENTRY_RELEASE}"` 추가.

#### 5-4. SPM 플러그인 불일치 시

- nvm으로 `.nvmrc` Node 버전 활성화 후 `npx cap update ios`
- diff 확인 후 사용자에게 보고
- `ios/App/CapApp-SPM/Package.swift` 변경분만 커밋 대상에 포함

#### 5-5. 버전 bump

- `project.pbxproj`의 `MARKETING_VERSION` 와 `CURRENT_PROJECT_VERSION`을 결정된 값으로 변경 (Debug/Release 양쪽)
- `replace_all`로 한 번에 변경
- `plutil -lint`로 재검증

### 6. 검증

병렬:

- `plutil -lint ios/App/App.xcodeproj/project.pbxproj`
- `plutil -lint ios/App/App/PrivacyInfo.xcprivacy`
- `xcodebuild -project ios/App/App.xcodeproj -list | head -5` (스킴 정상)
- `bash -n scripts/build-ios.sh` (스크립트 문법)
- Sentry release dry-run: pbxproj에서 버전 파싱 후 `ios@<MV>+<BN>.<sha>` 출력

모두 OK인지 확인 후 다음 단계.

### 7. 릴리스 노트 초안 작성

App Store Connect의 **"이번 버전의 새로운 기능"** 입력란용 한국어 문구 1~4줄 초안.

**소스 산정**:

- 이전 MARKETING_VERSION bump 커밋 찾기:
  ```bash
  git log --oneline --grep="bump\|버전\|iOS .* 으로" -i -- ios/App/App.xcodeproj/project.pbxproj | head -5
  ```
- 그 커밋 이후 main에 머지된 PR 목록 수집:
  ```bash
  git log <prev-bump-sha>..HEAD --oneline --merges --first-parent
  git log <prev-bump-sha>..HEAD --oneline --no-merges
  ```

**작성 원칙**:

- **사용자 관점** 표현. 내부 용어(refactor/SPM/lint/사이드이펙트)·파일 경로·이슈 번호 금지
- 1~4줄, 줄당 ~40자. 줄바꿈은 `\n`
- 동사형 마무리 ("개선했어요", "추가했어요"). 너무 마케팅 어조 금지 — 담백하게
- 버그 픽스만 있는 빌드면 "안정성 개선" 한 줄로 통합 가능
- 신기능과 개선이 섞이면 신기능 먼저, 개선 뒤

**스타일 예시**:

```text
- 새로운 '작성한 리뷰' 화면에서 내가 남긴 리뷰를 모아볼 수 있어요
- 마이페이지 디자인을 정돈했어요
- 지도와 리뷰 등록 흐름의 작은 불편함을 개선했어요
```

**출력**: 사용자에게 보여주고 다음과 같이 확인:

```text
## 📝 릴리스 노트 초안 (App Store Connect '이번 버전의 새로운 기능')

<생성된 1~4줄>

이대로 PR 본문에 포함해도 될까요? (수정 의견 주시면 반영합니다)
```

사용자 응답 받은 후 본문 확정. 영문 버전이 필요하다고 하면 한국어 확정 후 영문도 동일 톤으로 1~4줄 추가 작성.

### 8. 브랜치 생성

**브랜치명**:

- `$ARGUMENTS`에 명시 안 됐으면 `release/ios-<버전>-<짧은 설명>` 형식 (예: `release/ios-2.1-privacy-manifest`)
- 항상 `origin/main`에서 분기:
  ```bash
  git checkout -b release/ios-<버전>-<설명> origin/main
  git branch --unset-upstream
  ```

### 9. 커밋 작성

**금지**:

- `git add -A` / `git add .` 금지
- `.env.local` 등 민감 파일 절대 add 금지 (.env.capacitor는 OK - placeholder만)
- 훅 우회 금지, amend 금지

**스테이징** (명시적):

```bash
git add ios/App/App/PrivacyInfo.xcprivacy \
        ios/App/App.xcodeproj/project.pbxproj \
        ios/App/CapApp-SPM/Package.swift \
        scripts/build-ios.sh \
        .env.capacitor
```

**커밋 메시지** (HEREDOC + 마지막에 `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`):

```text
chore: iOS <MV> (build <BN>) bump + 앱스토어 제출 준비

- iOS 버전: <MV-prev> → <MV>, build <BN-prev> → <BN>
- Privacy Manifest 추가 (생성된 경우)
- SPM에 SentryCapacitor 등록 (변경된 경우)
- build-ios.sh: Sentry release 자동 태깅 (변경된 경우)
- .env.capacitor: Sentry 환경변수 placeholder 추가 (변경된 경우)
```

분량이 크면 커밋 분할 검토 후 사용자 확인.

### 10. 푸시/PR 사용자 승인 — 🛑 멈춤

커밋 완료 후 다음 형식으로 보고:

```text
✅ 커밋 완료
- 브랜치: release/ios-<버전>-<설명>
- 커밋: <commit-hash> <subject>
- 변경 파일: <N>개

📝 릴리스 노트 (확정본):
<7단계에서 확정한 1~4줄>

남은 작업: Xcode에서 Archive → App Store Connect 업로드

다음 단계로 진행할까요?
  1. origin에 푸시
  2. 푸시 + PR 생성 (base: main)
  3. 여기서 멈춤 (직접 처리)
```

**사용자의 명시적 승인 없이는 절대 `git push`나 `gh pr create` 실행 금지.**

### 11. 푸시 + PR (승인 받은 경우만)

```bash
git push -u origin release/ios-<버전>-<설명>
```

PR 생성 (**base: main**, HEREDOC) — 릴리스 노트를 PR 본문에 포함:

```bash
gh pr create --base main --title "chore: iOS <MV> (build <BN>) 앱스토어 제출 준비" --body "$(cat <<'EOF'
## Summary
- iOS 마케팅 버전 <MV-prev> → <MV>, 빌드 <BN-prev> → <BN>
- <변경된 항목들 bullet>

## App Store '이번 버전의 새로운 기능' (확정본)
```

<7단계에서 확정한 1~4줄>

```

## Test plan
- [ ] `npm run build:ios` 실행 → 빌드 성공
- [ ] Xcode에서 App 스킴 선택 → Product → Archive 성공
- [ ] Organizer에서 App Store Connect 업로드 성공
- [ ] App Store Connect에서 새 빌드(<MV> build <BN>) 인식 확인
- [ ] Privacy Manifest 누락 경고 없음

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

완료 후 PR URL 출력.

### 12. Archive 안내 (수동 단계)

PR 머지 후 사용자가 직접 진행하도록 다음 가이드 출력:

```text
PR 머지 후 Archive 단계:

1) 최신 main 동기화
   git checkout main && git pull origin main

2) Node 버전 맞추기
   nvm use $(cat .nvmrc)

3) iOS 빌드 + Xcode 열기 (자동)
   npm run build:ios
   # → next build → cap sync → Xcode 자동 오픈

4) Xcode에서:
   - 상단 디바이스 선택: 'Any iOS Device (arm64)'
   - 스킴: 'App'
   - Product → Archive
   - Organizer 열리면 → Distribute App → App Store Connect → Upload

5) App Store Connect (https://appstoreconnect.apple.com):
   - 새 빌드 처리 완료까지 5-30분 대기
   - 새 버전 만들기 → 빌드 선택 → "이번 버전의 새로운 기능"에 위 릴리스 노트 입력
   - 심사 제출
```

## 안전 수칙 (항상 적용)

- main 직접 푸시 금지 (PR로만)
- force push 금지
- destructive 작업(`reset --hard`, `branch -D`, `clean -f`) 금지 (단, 잘못 만든 임시 브랜치 정리는 사용자 확인 후 허용)
- `.env.local` 커밋 절대 금지
- `npx cap update ios` 같은 코드 생성 명령은 변경분 사용자 검토 후 커밋
- 버전 결정은 반드시 사용자 확인 (자동 추측 금지)
- 릴리스 노트는 반드시 사용자 확인 받은 후 PR 본문/안내에 포함
- 사용자의 명시 승인 없이 push/PR/merge 금지
