import * as Sentry from "@sentry/nextjs";

const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

const baseConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  // Vercel은 Production/Preview 모두 NODE_ENV=production이라 둘이 안 구분됨.
  // VERCEL_ENV("production" | "preview" | "development")로 분리해야 Preview 이슈가 prod 알림에 안 섞임.
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
};

if (isCapacitor) {
  // Capacitor 네이티브 빌드: iOS 네이티브 크래시까지 캡처 (@sentry/capacitor가 JS SDK를 래핑)
  // require로 받는 이유 — @sentry/capacitor는 자체 @sentry/core를 번들해 nextjs와 타입이 다름
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SentryCapacitor = require("@sentry/capacitor");
  SentryCapacitor.init(baseConfig, Sentry.init);
} else {
  Sentry.init({
    ...baseConfig,
    // 세션 리플레이: 평상시 10%, 에러 발생 세션 100% (웹 전용)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
