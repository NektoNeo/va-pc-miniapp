import { toast as sonnerToast } from "sonner";

/**
 * Centralized toast utilities for consistent notifications across Admin Panel
 *
 * Usage:
 * ```ts
 * import { toast } from "@/lib/toast";
 *
 * toast.success("Сборка создана");
 * toast.error("Не удалось сохранить", "Проверьте подключение");
 * toast.promise(saveData(), {
 *   loading: "Сохранение...",
 *   success: "Сохранено",
 *   error: "Ошибка сохранения"
 * });
 * ```
 */

export const toast = {
  /**
   * Success toast
   * @param message - Main message
   * @param description - Optional description
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Error toast
   * @param message - Main message
   * @param description - Optional description
   */
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Info toast
   * @param message - Main message
   * @param description - Optional description
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Warning toast
   * @param message - Main message
   * @param description - Optional description
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Loading toast
   * @param message - Loading message
   * @returns Toast ID for later dismissal
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Promise toast - automatically shows loading, success, or error
   * @param promise - Promise to track
   * @param messages - Messages for each state
   *
   * @example
   * ```ts
   * toast.promise(
   *   fetch('/api/save').then(r => r.json()),
   *   {
   *     loading: 'Сохранение...',
   *     success: (data) => `Сохранено: ${data.title}`,
   *     error: 'Не удалось сохранить'
   *   }
   * );
   * ```
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast
   * @param toastId - Toast ID returned from loading()
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
