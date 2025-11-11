/**
 * Telegram Theme Params → CSS Variables Mapper
 * Maps Telegram Mini App themeParams to VA-PC CSS custom properties
 */

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

/**
 * Simple hex to oklch (approximation)
 */
function hexToOklch(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);

  let hue = 0;
  if (chroma !== 0) {
    const max = Math.max(r, g, b);
    if (max === r) hue = ((g - b) / chroma) % 6;
    else if (max === g) hue = (b - r) / chroma + 2;
    else hue = (r - g) / chroma + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return `oklch(${luminance.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
}

export function applyTelegramTheme(themeParams: TelegramThemeParams): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Preserve VA-PC violet branding, only adjust backgrounds
  if (themeParams.bg_color) {
    root.style.setProperty("--background", hexToOklch(themeParams.bg_color));
  }

  if (themeParams.text_color) {
    root.style.setProperty("--foreground", hexToOklch(themeParams.text_color));
  }

  if (themeParams.secondary_bg_color) {
    root.style.setProperty("--card", hexToOklch(themeParams.secondary_bg_color));
  }

  if (themeParams.hint_color) {
    root.style.setProperty("--muted-foreground", hexToOklch(themeParams.hint_color));
  }
}

export function initTelegramTheme(): void {
  if (typeof window === "undefined") return;

  const tg = (window as any).Telegram?.WebApp;

  if (!tg) {
    console.warn("Not running in Telegram Mini App");
    return;
  }

  if (tg.themeParams) {
    applyTelegramTheme(tg.themeParams);
  }

  tg.onEvent?.("themeChanged", () => {
    if (tg.themeParams) applyTelegramTheme(tg.themeParams);
  });

  tg.expand?.();
}

export function forceDarkMode(): void {
  if (typeof window === "undefined") return;
  document.documentElement.classList.add("dark");
}
