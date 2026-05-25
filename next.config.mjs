import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */

const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

const nextConfig = {
  // Capacitor 빌드 시 정적 내보내기
  ...(isCapacitor && {
    output: "export",
  }),

  // API 프록시 설정 (Capacitor에서는 rewrites 불가 → 직접 API URL 사용)
  ...(!isCapacitor && {
    async rewrites() {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return [];
      }
      return [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/:path*`,
        },
      ];
    },
  }),

  // 이미지 최적화 도메인 (Capacitor에서는 unoptimized)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gotcha-storage.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "d30h2jkisryuo5.cloudfront.net",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    unoptimized: isCapacitor || process.env.NODE_ENV === "development",
  },

  // 외부 스크립트 (Kakao Map SDK)
  // 실제 로딩은 app/layout.tsx의 Script 컴포넌트 사용
};

export default withSentryConfig(nextConfig, {
  // Sentry 조직/프로젝트 (소스맵 업로드용 — 빌드 환경변수로도 주입 가능)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 빌드 로그 최소화
  silent: !process.env.CI,

  // 클라이언트 번들에 더 많은 파일의 소스맵 업로드 (정확한 스택트레이스용)
  widenClientFileUpload: true,

  // 광고 차단기 우회용 터널 라우트 — 정적 내보내기엔 rewrites 불가하므로 웹 빌드에서만 활성
  tunnelRoute: isCapacitor ? undefined : "/monitoring",

  webpack: {
    // Sentry 디버그 로거 트리쉐이킹 (번들 크기 ↓)
    treeshake: {
      removeDebugLogging: true,
    },
    // Vercel Cron 모니터링 자동 등록 (Capacitor 빌드와 무관)
    automaticVercelMonitors: !isCapacitor,
  },
});
