import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "miniapp@dev",

  // Performance Monitoring
  // In production: 20% of transactions, in dev: 100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
