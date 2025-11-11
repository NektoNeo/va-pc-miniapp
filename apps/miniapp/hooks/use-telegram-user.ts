"use client";

import { useEffect, useState } from "react";

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  allowsWriteToPm?: boolean;
  addedToAttachmentMenu?: boolean;
}

/**
 * Hook to access Telegram user data from Mini App
 * Returns user info from initData if available
 */
export function useTelegramUser(): TelegramUser | null {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) {
      return;
    }

    const webApp = window.Telegram.WebApp;
    const initDataUnsafe = webApp.initDataUnsafe;

    if (initDataUnsafe?.user) {
      const tgUser = initDataUnsafe.user;

      setUser({
        id: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        languageCode: tgUser.language_code,
        isPremium: tgUser.is_premium,
        photoUrl: tgUser.photo_url,
        allowsWriteToPm: tgUser.allows_write_to_pm,
        addedToAttachmentMenu: tgUser.added_to_attachment_menu,
      });
    }
  }, []);

  return user;
}

/**
 * Get user display name from Telegram user data
 */
export function getUserDisplayName(user: TelegramUser | null): string {
  if (!user) return "Гость";

  if (user.username) return `@${user.username}`;

  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.join(" ") || "Пользователь";
}

/**
 * Get user avatar initials for fallback
 */
export function getUserInitials(user: TelegramUser | null): string {
  if (!user) return "?";

  const firstInitial = user.firstName?.[0] || "";
  const lastInitial = user.lastName?.[0] || "";

  return (firstInitial + lastInitial).toUpperCase() || "?";
}
