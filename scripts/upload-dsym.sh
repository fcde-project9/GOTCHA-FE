#!/bin/bash
# Sentry로 iOS dSYM 수동 업로드 스크립트
#
# 사용처:
# 1. Xcode Run Script Phase에서 자동 호출 (권장) — .ai/sentry.md 참고
# 2. 누락 시 사후 수동 호출:
#      bash scripts/upload-dsym.sh <DWARF_DSYM_FOLDER_PATH>
#    예) Archive 후 Organizer에서 Archive 우클릭 → Show in Finder →
#        .xcarchive 패키지 우클릭 → 패키지 내용 보기 → dSYMs 폴더 경로
#
# 환경변수:
#   - SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
#   - 미설정 시 .env.local에서 로드 시도
#
# 의존성: sentry-cli (brew install getsentry/tools/sentry-cli)

set -e

# .env.local에서 Sentry 환경변수 로드
# eval 대신 line-by-line parser 사용 — .env.local 값에 포함된 $(...), `...`, ;,
# && 등이 명령으로 실행되는 인젝션 방지 (defense-in-depth)
if [ -f ".env.local" ]; then
  set -a
  while IFS= read -r line || [ -n "$line" ]; do
    # 주석/공백 라인 skip
    case "$line" in
      \#*|"") continue ;;
    esac
    # SENTRY_(ORG|PROJECT|AUTH_TOKEN)= 만 매치
    case "$line" in
      SENTRY_ORG=*|SENTRY_PROJECT=*|SENTRY_AUTH_TOKEN=*)
        key=${line%%=*}
        value=${line#*=}
        export "$key=$value"
        ;;
    esac
  done < .env.local
  set +a
fi

: "${SENTRY_ORG:?SENTRY_ORG 미설정 — .env.local 확인}"
: "${SENTRY_PROJECT:?SENTRY_PROJECT 미설정 — .env.local 확인}"
: "${SENTRY_AUTH_TOKEN:?SENTRY_AUTH_TOKEN 미설정 — .env.local 확인}"

if ! command -v sentry-cli >/dev/null 2>&1; then
  echo "❌ sentry-cli 미설치. 설치: brew install getsentry/tools/sentry-cli"
  exit 1
fi

DSYM_PATH="${1:-${DWARF_DSYM_FOLDER_PATH:-}}"
if [ -z "$DSYM_PATH" ] || [ ! -d "$DSYM_PATH" ]; then
  echo "❌ dSYM 경로 없음 또는 디렉터리 아님: '$DSYM_PATH'"
  echo "   인자로 dSYMs 폴더 경로를 넘기거나 Xcode Run Script Phase에서 호출하세요."
  exit 1
fi

echo "▶ Sentry dSYM 업로드 — org=$SENTRY_ORG project=$SENTRY_PROJECT"
echo "  source: $DSYM_PATH"

sentry-cli debug-files upload \
  --org "$SENTRY_ORG" \
  --project "$SENTRY_PROJECT" \
  --include-sources \
  "$DSYM_PATH"

echo "✅ Sentry dSYM 업로드 완료"
