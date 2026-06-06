---
description: dev 최신화 확인 → 브랜치 생성 → 커밋 → 푸시/PR은 사용자 승인 후 진행
allowed-tools: Bash, Read, Edit
argument-hint: "[선택] 브랜치 이름 또는 작업 설명"
---

dev 브랜치 기준 워크플로우로 커밋을 작성합니다. 푸시와 PR은 사용자 명시 승인 후에만 진행합니다.

사용자 인자: $ARGUMENTS

## 절차

### 1. 현재 상태 점검

다음을 **단일 메시지에서 병렬로** 실행:

- `git status` (`-uall` 플래그 금지)
- `git diff` (스테이지 + 미스테이지 변경 모두)
- `git diff --staged`
- `git branch --show-current`
- `git log -1 --format=%H` (현재 HEAD)
- `git fetch origin dev` (원격 dev 최신 정보 동기화)
- `git log origin/dev..HEAD --oneline` (현재 브랜치가 dev 대비 앞서있는 커밋)
- `git log HEAD..origin/dev --oneline` (dev에 있는데 현재 브랜치에 없는 커밋)

### 2. dev 최신화 상태 확인

`git fetch` 후:

- **현재 브랜치가 dev**:
  - 로컬 dev가 `origin/dev`와 동일 → OK, 다음 단계에서 새 브랜치 생성
  - 로컬 dev가 뒤처져 있음 → 사용자에게 알리고 `git pull origin dev` 진행 여부 확인
  - 로컬 dev가 앞서있음 (이미 로컬 커밋 있음) → 사용자에게 상황 보고 후 진행 방향 협의

- **현재 브랜치가 dev가 아닌데 변경사항이 있음**:
  - 현재 브랜치가 dev에서 갈라진 게 맞는지 확인 (`git merge-base HEAD origin/dev`)
  - 이미 작업 브랜치에 있고 변경사항이 있다면 **새 브랜치 생성 없이 그대로 진행**해도 되는지 사용자에게 물어보기
  - 사용자가 새 브랜치 원하면, 현재 변경사항을 stash 또는 새 브랜치로 이전 후 진행

### 3. 새 브랜치 생성 (필요한 경우)

브랜치명 결정:

- 사용자가 `$ARGUMENTS`에 브랜치명을 명시했으면 그것 사용
- 아니면 변경사항 내용을 분석해 적절한 이름 제안 (예: `feat/community-write-cleanup`, `fix/header-sticky`)
- 접두사 규칙(저장소 관례 확인): `feat/`, `fix/`, `chore/`, `refactor/`, `docs/` 등

```bash
git checkout -b <branch-name> origin/dev
```

### 4. 변경사항 분석 + 커밋 메시지 작성

**파일별 변경 의도 분석**:

- 새 파일 추가 vs 기존 수정 vs 삭제
- 단일 목적의 변경인지, 여러 관심사가 섞였는지
- 여러 관심사가 섞였으면 사용자에게 **커밋 분할 의사** 확인

**커밋 메시지 스타일 (저장소 관례 따름)**:

`git log --oneline -10`으로 최근 커밋 메시지 형식 확인 후 그 스타일 모방. 일반적 형식:

```text
<type>: <한국어 요약 (1줄)>

- 무엇을 왜 변경했는지 (선택)
- 영향받은 모듈 / 관련 이슈 번호
```

- `feat`: 신규 기능
- `fix`: 버그 수정
- `chore`: 빌드/설정/잡일
- `refactor`: 기능 변경 없는 구조 개선
- `docs`: 문서

**금지**:

- `git add -A` / `git add .` 사용 금지 (실수로 .env 등 포함 위험). 변경된 파일을 명시적으로 추가.
- `.env`, `credentials.json`, 키 파일 등 민감 파일 커밋 금지. 만약 staged에 포함됐으면 사용자에게 경고.
- 훅 우회 금지 (`--no-verify` X)
- amend 금지 (새 커밋 생성)

### 5. 커밋 실행

병렬로:

- `git add <명시적 파일들>`
- `git commit -m "$(cat <<'EOF' ... EOF)"` 형식으로 HEREDOC 사용
  - 메시지 마지막에 `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` 포함
- 이후 순차적으로 `git status`로 커밋 결과 확인

**훅 실패 시**: 원인 진단 후 **새 커밋**으로 수정 (amend 금지). 훅 우회 금지.

### 6. 푸시 / PR 작성 — 🛑 사용자 승인 필요

커밋이 완료되면 **반드시 멈춰서** 다음을 사용자에게 보고:

```text
✅ 커밋 완료
- 브랜치: <branch-name>
- 커밋 메시지: <summary>
- 변경 파일: <N>개

다음 단계로 진행할까요?
  1. origin에 푸시
  2. 푸시 + PR 생성 (base: dev)
  3. 여기서 멈춤 (사용자가 직접 처리)

원하는 동작을 알려주세요.
```

**사용자의 명시적 승인 없이는 절대 `git push`나 `gh pr create`를 실행하지 말 것.**

### 7. 푸시 + PR 작성 (승인 받은 경우만)

**푸시**:

```bash
git push -u origin <branch-name>
```

**PR 생성** (base: dev):

- PR 제목: 70자 이내, 커밋 메시지 요약 기반
- PR 본문은 HEREDOC으로 전달
- 형식:

```bash
gh pr create --base dev --title "<title>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>

## Test plan
- [ ] <검증 항목>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

완료 후 PR URL을 사용자에게 출력.

### 8. PR 머지 후 로컬 브랜치 정리

PR 생성 직후, 사용자에게 머지 후 자동 정리 여부를 안내:

```text
PR 머지가 완료되면 알려주세요. 다음을 자동으로 처리합니다:
  - dev로 체크아웃
  - origin/dev pull (최신화)
  - 로컬 작업 브랜치 삭제
  - (원격 브랜치는 GitHub "Delete branch" 버튼이 처리)
```

사용자가 "머지됐다" / "merged" 등을 알리면 **반드시 머지 여부를 먼저 확인**한 뒤 정리 실행:

**1) 머지 여부 확인** (병렬):

- `gh pr view <PR번호> --json state,mergedAt,mergeCommit` — `state == "MERGED"` 인지 검증
- `git branch --show-current` — 현재 브랜치 확인

머지 상태가 아니면 정리 중단하고 사용자에게 현 상태 보고.

**2) 정리 실행** (순차):

```bash
git checkout dev
git pull origin dev
git branch -D <branch-name>
```

- 이 저장소는 **squash merge가 기본**이므로 머지된 브랜치라도 `git branch -d`(안전 삭제)는 거의 항상 실패한다 (커밋 SHA가 다름). 따라서 `gh pr view`로 `state == "MERGED"` 검증을 마쳤다면 `-D`(강제 삭제) 사용이 정상 경로.
- **전제 조건**: 1단계의 `gh pr view` 머지 검증을 반드시 통과한 상태여야 함. 검증 없이 `-D` 사용 금지.
- merge 방식이 squash가 아닌 일반/rebase merge인 경우엔 `-d`도 성공하지만, 일관성을 위해 `-D` 사용해도 무방.

**3) 결과 보고**:

```text
✅ 정리 완료
- 현재 브랜치: dev (origin/dev 최신)
- 삭제된 로컬 브랜치: <branch-name>
```

## 안전 수칙 (항상 적용)

- main/master 직접 푸시 금지
- force push 금지 (사용자가 명시 요청해도 main에는 금지)
- destructive 작업(`reset --hard`, `branch -D`, `clean -f`) 금지
- 사용자가 명확히 허락하지 않은 작업은 절대 수행하지 않음
- 작업 시작 전 현재 상태(브랜치/변경사항) 사용자에게 한 줄로 보고
