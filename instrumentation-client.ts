import * as Sentry from "@sentry/nextjs";

console.log("🔵 SENTRY CLIENT CONFIG LOADING...");
console.log("🔵 DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN);

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Release tracking - automatically set by Sentry webpack plugin during build
  // Format: "miniapp@0.1.0" or with git hash: "miniapp@0.1.0+abc123"
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "miniapp@dev",

  // Error Event Sampling - capture ALL errors
  sampleRate: 1.0,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.feedbackIntegration({
      colorScheme: "system",
    }),
  ],

  // Set environment
  environment: process.env.NODE_ENV,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Debug hook to see what's being sent
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔴 Sentry beforeSend:", {
        event_id: event.event_id,
        level: event.level,
        message: event.message,
        exception: event.exception,
        type: event.type,
      });
    }
    return event;
  },
});

// Required export for Next.js router instrumentation
export function onRouterTransitionStart() {
  // This hook enables automatic performance tracing for client-side navigations
}
