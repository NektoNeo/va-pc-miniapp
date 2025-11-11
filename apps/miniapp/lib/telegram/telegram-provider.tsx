"use client";

import { useEffect } from "react";
import Script from "next/script";
import * as Sentry from "@sentry/nextjs";
import { applyTelegramThemeVars } from "./theme";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Telegram WebApp when ready
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      // Apply Telegram theme parameters and safe area insets
      applyTelegramThemeVars();

      // Set Sentry user context from Telegram user data
      try {
        const initDataUnsafe = webApp.initDataUnsafe;
        if (initDataUnsafe?.user) {
          const user = initDataUnsafe.user;

          // Set Sentry user context with Telegram user info
          Sentry.setUser({
            id: user.id.toString(),
            username: user.username || `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`,
          });

          // Add custom tags for better filtering
          Sentry.setTag("telegram_user_id", user.id.toString());
          Sentry.setTag("telegram_language", user.language_code || "unknown");

          if (user.is_premium) {
            Sentry.setTag("telegram_premium", "true");
          }

          // Log successful Sentry context setup in development
          if (process.env.NODE_ENV === "development") {
            console.log("🔴 Sentry user context set:", {
              id: user.id,
              username: user.username,
              language: user.language_code,
              premium: user.is_premium,
            });
          }
        }
      } catch (error) {
        console.error("Failed to set Sentry user context:", error);
        Sentry.captureException(error, {
          tags: { context: "telegram_provider_init" },
        });
      }
    }
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
