import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  // Vercel은 Production/Preview 모두 NODE_ENV=production. VERCEL_ENV로 분리.
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
});
