import { useEffect, useState } from "react";

/**
 * Debounce hook - delays updating a value until after a specified delay
 *
 * Useful for search inputs to reduce API calls
 *
 * @example
 * ```ts
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   // This will only fire 500ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
