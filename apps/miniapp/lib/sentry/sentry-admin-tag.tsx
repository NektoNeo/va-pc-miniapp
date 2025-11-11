"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

/**
 * Props для SentryAdminTag компонента
 */
interface SentryAdminTagProps {
  /** Admin user ID */
  adminId: string;
  /** Admin email */
  adminEmail: string;
  /** Admin role (SUPER_ADMIN | ADMIN | EDITOR) */
  adminRole: string;
}

/**
 * Maps admin URL paths to feature tags for Sentry error tracking
 */
function getAdminFeature(pathname: string): string {
  // Dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    return "dashboard";
  }

  // PC Builds
  if (pathname.startsWith("/admin/pcs")) {
    return "pc-builds";
  }

  // Promotions
  if (pathname.startsWith("/admin/promos")) {
    return "promotions";
  }

  // Devices
  if (pathname.startsWith("/admin/devices")) {
    return "devices";
  }

  // Categories
  if (pathname.startsWith("/admin/categories")) {
    return "categories";
  }

  // Settings
  if (pathname.startsWith("/admin/settings")) {
    return "settings";
  }

  // FPS Metrics
  if (pathname.startsWith("/admin/fps")) {
    return "fps-metrics";
  }

  // Media Library
  if (pathname.startsWith("/admin/media")) {
    return "media-library";
  }

  // Leads
  if (pathname.startsWith("/admin/leads")) {
    return "leads";
  }

  // Authentication
  if (pathname.startsWith("/admin/login")) {
    return "auth";
  }

  // Unknown admin route
  return "admin-unknown";
}

/**
 * Component that automatically sets Sentry tags for admin panel routes
 *
 * Устанавливает теги для всех ошибок в Admin Panel:
 * - route: "admin" (фиксированный тег для всех admin routes)
 * - feature: конкретная фича (pc-builds, promotions, devices, и т.д.)
 * - adminId: ID администратора
 * - adminEmail: Email администратора
 * - adminRole: Роль администратора
 *
 * Также устанавливает Sentry user context для удобства debugging.
 *
 * @example
 * ```tsx
 * // В app/admin/layout.tsx
 * const session = await getSession();
 *
 * <SentryAdminTag
 *   adminId={session.userId}
 *   adminEmail={session.email}
 *   adminRole={session.role}
 * />
 * ```
 */
export function SentryAdminTag({
  adminId,
  adminEmail,
  adminRole,
}: SentryAdminTagProps) {
  const pathname = usePathname();

  useEffect(() => {
    const feature = getAdminFeature(pathname);

    // Set Sentry tags for error filtering
    Sentry.setTag("route", "admin");
    Sentry.setTag("feature", feature);
    Sentry.setTag("adminId", adminId);
    Sentry.setTag("adminEmail", adminEmail);
    Sentry.setTag("adminRole", adminRole);

    // Set detailed context for debugging
    Sentry.setContext("admin", {
      feature,
      pathname,
      adminId,
      adminEmail,
      adminRole,
      timestamp: new Date().toISOString(),
    });

    // Set user context (helpful for Sentry user tracking)
    Sentry.setUser({
      id: adminId,
      email: adminEmail,
      role: adminRole,
    });

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔴 Sentry admin tags set:", {
        route: "admin",
        feature,
        adminId,
        adminEmail,
        adminRole,
        pathname,
      });
    }
  }, [pathname, adminId, adminEmail, adminRole]);

  return null; // This component doesn't render anything
}
