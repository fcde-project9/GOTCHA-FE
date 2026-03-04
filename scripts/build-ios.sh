#!/bin/bash
# iOS 빌드 스크립트
# .env.local을 운영 환경으로 교체 → 빌드 → 롤백 → cap sync → Xcode 열기

set -e

# nvm 로드
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" || true

# Node 24로 전환
if command -v nvm >/dev/null 2>&1; then
  nvm use 24
fi

# .env.local 백업 및 운영 환경으로 교체
cp .env.local .env.local.bak
sed -e 's|^NEXT_PUBLIC_API_BASE_URL=.*|NEXT_PUBLIC_API_BASE_URL=https://api.gotcha.it.com|' \
    -e 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://gotcha.it.com|' \
    .env.local.bak > .env.local

# 빌드 (성공/실패 관계없이 롤백)
NEXT_PUBLIC_BUILD_TARGET=capacitor npx next build
BUILD_EXIT=$?

# .env.local 롤백
cp .env.local.bak .env.local && rm .env.local.bak

if [ $BUILD_EXIT -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

# Capacitor sync & Xcode 열기
npx cap sync ios
npx cap open ios
