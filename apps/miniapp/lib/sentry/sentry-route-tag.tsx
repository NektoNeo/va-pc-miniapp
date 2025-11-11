"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

/**
 * Maps URL paths to route/feature tags for Sentry error tracking
 */
function getRouteTag(pathname: string): string {
  // Home page
  if (pathname === "/") {
    return "home";
  }

  // PC listing page
  if (pathname === "/pcs") {
    return "pcs";
  }

  // Product detail page
  if (pathname.startsWith("/pcs/") && pathname !== "/pcs") {
    return "product";
  }

  // Devices page (filter interactions)
  if (pathname === "/devices") {
    return "filters";
  }

  // Configurator (if exists)
  if (pathname === "/configurator" || pathname.startsWith("/configurator/")) {
    return "configurator";
  }

  // Docs page
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return "docs";
  }

  // Test pages
  if (pathname.startsWith("/test-")) {
    return "test";
  }

  // Default/unknown route
  return "other";
}

/**
 * Component that automatically sets Sentry route tag based on current URL
 * Add this to your root layout to track errors by route/feature
 */
export function SentryRouteTag() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTag = getRouteTag(pathname);

    // Set route tag for error filtering
    Sentry.setTag("route", routeTag);
    Sentry.setTag("pathname", pathname);

    // Set feature context for more detailed tracking
    Sentry.setContext("navigation", {
      route: routeTag,
      pathname,
      timestamp: new Date().toISOString(),
    });

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔴 Sentry route tag set:", {
        route: routeTag,
        pathname,
      });
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
