/**
 * Telegram Mini App Theme Integration
 *
 * Applies Telegram theme parameters to CSS variables for seamless integration
 * with user's Telegram theme (dark/light mode)
 */

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

/**
 * Apply Telegram theme parameters to CSS variables
 * Should be called on app initialization
 */
export function applyTelegramThemeVars(): void {
  // Check if running in Telegram WebApp
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }

  const themeParams = window.Telegram.WebApp.themeParams as TelegramThemeParams;
  const root = document.documentElement;

  // Apply Telegram theme colors to CSS variables
  if (themeParams.bg_color) {
    root.style.setProperty('--tg-bg-color', themeParams.bg_color);
  }

  if (themeParams.text_color) {
    root.style.setProperty('--tg-text-color', themeParams.text_color);
  }

  if (themeParams.hint_color) {
    root.style.setProperty('--tg-hint-color', themeParams.hint_color);
  }

  if (themeParams.link_color) {
    root.style.setProperty('--tg-link-color', themeParams.link_color);
  }

  if (themeParams.button_color) {
    root.style.setProperty('--tg-button-color', themeParams.button_color);
  }

  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
  }

  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--tg-secondary-bg', themeParams.secondary_bg_color);
  }

  // Apply safe area insets for notch/rounded corners support
  root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
  root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
  root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
  root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');

  // Expand to full height
  window.Telegram.WebApp.expand();

  // Mark as ready
  window.Telegram.WebApp.ready();
}

/**
 * Get current Telegram theme parameters
 */
export function getTelegramTheme(): TelegramThemeParams | null {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }

  return window.Telegram.WebApp.themeParams as TelegramThemeParams;
}

/**
 * Check if app is running in dark mode based on Telegram theme
 */
export function isTelegramDarkMode(): boolean {
  const theme = getTelegramTheme();

  if (!theme || !theme.bg_color) {
    return false;
  }

  // Convert hex to RGB and check brightness
  const hex = theme.bg_color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

/**
 * Trigger haptic feedback for user interactions (iOS/Android vibration)
 * Enhances UX by providing tactile feedback on button taps
 *
 * @param type - Type of haptic feedback
 * @param style - Impact style (ignored for notification/selection)
 */
export function triggerHaptic(
  type: 'impact' | 'notification' | 'selection' = 'impact',
  style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning' = 'medium'
): void {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.HapticFeedback) {
    return;
  }

  try {
    const haptic = window.Telegram.WebApp.HapticFeedback;

    if (type === 'impact') {
      haptic.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
    } else if (type === 'notification') {
      haptic.notificationOccurred(style as 'error' | 'success' | 'warning');
    } else if (type === 'selection') {
      haptic.selectionChanged();
    }
  } catch (error) {
    // Silently fail - haptics are optional UX enhancement
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Show Telegram MainButton (native bottom button)
 * Useful for primary actions like "Buy", "Submit", "Continue"
 *
 * @param text - Button text
 * @param onClick - Click handler
 * @param options - Additional button options
 * @returns Cleanup function to hide button and remove listener
 */
export function showMainButton(
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  }
): () => void {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.MainButton) {
    return () => {};
  }

  const btn = window.Telegram.WebApp.MainButton;

  btn.setText(text);

  if (options?.color) btn.setParams({ color: options.color });
  if (options?.textColor) btn.setParams({ text_color: options.textColor });
  if (options?.isActive !== undefined) btn.setParams({ is_active: options.isActive });
  if (options?.isVisible !== undefined) btn.setParams({ is_visible: options.isVisible });

  btn.show();
  btn.onClick(onClick);

  // Return cleanup function
  return () => {
    btn.hide();
    btn.offClick(onClick);
  };
}

/**
 * Hide Telegram MainButton
 */
export function hideMainButton(): void {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.MainButton) {
    return;
  }

  window.Telegram.WebApp.MainButton.hide();
}
