import { useState, useCallback } from "react";
import { toast } from "@/lib/toast";

type MutationOptions<TData, TVariables> = {
  /**
   * Function to call before mutation
   * Should return optimistic data to display immediately
   */
  onMutate?: (variables: TVariables) => TData | void;

  /**
   * Function to perform the actual mutation (API call)
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Called on successful mutation
   */
  onSuccess?: (data: TData, variables: TVariables) => void;

  /**
   * Called on mutation error
   */
  onError?: (error: Error, variables: TVariables) => void;

  /**
   * Toast messages
   */
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
};

/**
 * Optimistic Mutation Hook
 *
 * Provides optimistic UI updates for create/update/delete operations
 * Automatically handles loading states, errors, and rollback
 *
 * @example DELETE with optimistic removal
 * ```ts
 * const { mutate, isLoading } = useOptimisticMutation({
 *   mutationFn: async (id: string) => {
 *     const res = await fetch(`/api/admin/pcs/${id}`, { method: 'DELETE' });
 *     if (!res.ok) throw new Error('Failed');
 *     return res.json();
 *   },
 *   onSuccess: () => {
 *     // Refetch or update cache
 *     fetchPCs();
 *   },
 *   messages: {
 *     loading: 'Удаление...',
 *     success: 'Сборка удалена',
 *     error: 'Не удалось удалить'
 *   }
 * });
 *
 * <Button onClick={() => mutate(pc.id)}>Удалить</Button>
 * ```
 *
 * @example CREATE with optimistic addition
 * ```ts
 * const { mutate } = useOptimisticMutation({
 *   mutationFn: async (data: PCInput) => {
 *     const res = await fetch('/api/admin/pcs', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return res.json();
 *   },
 *   onMutate: (data) => {
 *     // Optimistically add to UI
 *     setPCs(prev => [...prev, { id: 'temp', ...data }]);
 *   },
 *   onSuccess: (result) => {
 *     // Replace temp with real data
 *     setPCs(prev => prev.map(pc =>
 *       pc.id === 'temp' ? result : pc
 *     ));
 *   }
 * });
 * ```
 */
export function useOptimisticMutation<TData = any, TVariables = any>(
  options: MutationOptions<TData, TVariables>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      let toastId: string | number | undefined;

      try {
        // Show loading toast if message provided
        if (options.messages?.loading) {
          toastId = toast.loading(options.messages.loading);
        }

        // Call onMutate for optimistic update
        const optimisticData = options.onMutate?.(variables);

        // Perform actual mutation
        const data = await options.mutationFn(variables);

        // Dismiss loading toast
        if (toastId) {
          toast.dismiss(toastId);
        }

        // Show success toast
        if (options.messages?.success) {
          toast.success(options.messages.success);
        }

        // Call onSuccess callback
        options.onSuccess?.(data, variables);

        setIsLoading(false);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // Dismiss loading toast
        if (toastId) {
          toast.dismiss(toastId);
        }

        // Show error toast
        if (options.messages?.error) {
          toast.error(options.messages.error, error.message);
        }

        // Call onError callback
        options.onError?.(error, variables);

        setIsLoading(false);
        throw error;
      }
    },
    [options]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}
