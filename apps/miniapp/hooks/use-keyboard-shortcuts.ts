/**
 * Keyboard Shortcuts Hooks
 *
 * Универсальные хуки для работы с горячими клавишами в Admin Panel.
 * Поддерживает cross-platform shortcuts (Cmd на Mac, Ctrl на Windows/Linux).
 */

import { useEffect, useCallback } from "react";
import { toast } from "@/lib/toast";

/**
 * Options для настройки keyboard shortcut
 */
type KeyboardShortcutOptions = {
  /** Требовать Ctrl (Windows/Linux) */
  ctrl?: boolean;
  /** Требовать Cmd (Mac) */
  meta?: boolean;
  /** Требовать Shift */
  shift?: boolean;
  /** Требовать Alt */
  alt?: boolean;
  /** Отключить shortcut */
  disabled?: boolean;
};

/**
 * Базовый хук для создания keyboard shortcuts
 *
 * @example
 * ```tsx
 * // Custom shortcut: Cmd+K для открытия поиска
 * useKeyboardShortcut('k', () => {
 *   openSearchModal();
 * }, { meta: true });
 * ```
 *
 * @example
 * ```tsx
 * // Ctrl+Shift+D для дублирования
 * useKeyboardShortcut('d', () => {
 *   duplicateItem();
 * }, { ctrl: true, shift: true });
 * ```
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: KeyboardShortcutOptions
) {
  // Мемоизируем callback чтобы избежать лишних re-renders
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    // Если disabled - не регистрируем listener
    if (options?.disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем что нажата нужная клавиша
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return;
      }

      // Проверяем модификаторы
      const hasCtrlOrMeta = event.ctrlKey || event.metaKey;

      // Если указаны ctrl или meta, проверяем их наличие
      if (options?.ctrl || options?.meta) {
        if (!hasCtrlOrMeta) return;
      }

      // Проверяем shift
      if (options?.shift !== undefined) {
        if (event.shiftKey !== options.shift) return;
      }

      // Проверяем alt
      if (options?.alt !== undefined) {
        if (event.altKey !== options.alt) return;
      }

      // Все проверки пройдены - выполняем callback
      event.preventDefault();
      memoizedCallback();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup при unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, memoizedCallback, options]);
}

/**
 * Convenience хук для Save shortcut (⌘S / Ctrl+S)
 *
 * Автоматически добавляет toast уведомление и поддерживает disabled state.
 *
 * @example
 * ```tsx
 * function PCBuildForm() {
 *   const { handleSubmit, formState: { isSubmitting } } = useForm();
 *
 *   const onSubmit = async (data) => {
 *     await savePC(data);
 *   };
 *
 *   useSaveShortcut(
 *     () => handleSubmit(onSubmit)(),
 *     isSubmitting
 *   );
 *
 *   return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
 * }
 * ```
 *
 * @param onSave - Функция сохранения
 * @param disabled - Отключить shortcut (например, во время isSubmitting)
 * @param message - Кастомное toast сообщение (опционально)
 */
export function useSaveShortcut(
  onSave: () => void,
  disabled?: boolean,
  message?: string
) {
  const memoizedOnSave = useCallback(() => {
    if (!disabled) {
      // Показываем toast с информацией о shortcut
      const toastMessage =
        message ||
        "Сохранение... (⌘S)";
      toast.info(toastMessage);

      // Выполняем callback
      onSave();
    }
  }, [onSave, disabled, message]);

  useKeyboardShortcut("s", memoizedOnSave, {
    ctrl: true,
    meta: true,
    disabled,
  });
}
