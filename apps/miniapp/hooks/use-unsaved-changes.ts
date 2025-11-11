import { useEffect, useCallback } from "react";

/**
 * Unsaved Changes Guard Hook
 *
 * Prevents accidental navigation away from forms with unsaved changes
 * Shows browser confirmation dialog when trying to close tab/window
 *
 * @param isDirty - Whether form has unsaved changes (from react-hook-form formState.isDirty)
 * @param message - Optional custom warning message
 *
 * @example
 * ```ts
 * const {
 *   formState: { isDirty },
 *   handleSubmit,
 * } = useForm();
 *
 * useUnsavedChanges(isDirty);
 *
 * // Or with custom message
 * useUnsavedChanges(
 *   isDirty,
 *   "У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?"
 * );
 * ```
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message: string = "У вас есть несохраненные изменения. Вы уверены?"
) {
  // Handle browser navigation (close tab, refresh, back button via browser UI)
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore custom message and show their own
      // But we still need to set returnValue to trigger the dialog
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, message]);

  /**
   * Manual confirmation check for custom navigation
   * Use this when programmatically navigating away
   *
   * @example
   * ```ts
   * const { confirmNavigation } = useUnsavedChanges(isDirty);
   *
   * const handleCancel = () => {
   *   if (confirmNavigation()) {
   *     router.push('/admin/pcs');
   *   }
   * };
   * ```
   */
  const confirmNavigation = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm(message);
  }, [isDirty, message]);

  return { confirmNavigation };
}
