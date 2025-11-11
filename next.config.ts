import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root warning
  turbopack: {
    root: process.cwd(),
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload sourcemaps during build
  silent: !process.env.CI,

  // Suppress logs in CI
  disableLogger: true,

  // Automatically annotate React components for better Sentry context
  reactComponentAnnotation: {
    enabled: true,
  },

  // Upload source maps to Sentry
  sourcemaps: {
    disable: false,
  },

  // Disable telemetry
  telemetry: false,
});
