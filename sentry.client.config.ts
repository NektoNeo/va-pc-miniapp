import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "miniapp@dev",

  // Performance Monitoring
  // In production: 20% of transactions, in dev: 100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay
  // In production: 10% of sessions, in dev: 100%
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Always capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Privacy settings for Session Replay
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Set environment
  environment: process.env.NODE_ENV,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
