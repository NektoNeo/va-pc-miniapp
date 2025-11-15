import { z } from "zod";

/**
 * Resolution enum для FPS метрик
 */
export const resolutionEnum = z.enum(["FHD", "QHD", "UHD4K"], {
  required_error: "Выберите разрешение",
});

/**
 * Zod validation schema для FPS Metric форм
 */
export const fpsMetricFormSchema = z.object({
  game: z
    .string()
    .min(1, "Название игры обязательно")
    .max(100, "Максимум 100 символов"),
  resolution: resolutionEnum,
  fpsMin: z
    .number()
    .int("Только целые числа")
    .positive("Должно быть больше 0")
    .max(999, "Максимум 999")
    .optional()
    .nullable(),
  fpsAvg: z
    .number({ required_error: "Средний FPS обязателен" })
    .int("Только целые числа")
    .positive("Должно быть больше 0")
    .max(999, "Максимум 999"),
  fpsP95: z
    .number()
    .int("Только целые числа")
    .positive("Должно быть больше 0")
    .max(999, "Максимум 999")
    .optional()
    .nullable(),
});

export type FpsMetricFormData = z.infer<typeof fpsMetricFormSchema>;

/**
 * Фиксированный список игр для FPS метрик
 * Ровно 13 игр - список не расширяется
 */
export const FIXED_GAMES = [
  "Forza Horizon 5",
  "Cyberpunk 2077",
  "GTA V",
  "CS 2",
  "PUBG",
  "Fortnite",
  "Rust",
  "Atomic Heart",
  "Hogwarts Legacy",
  "God of War",
  "RDR 2",
  "Apex Legends",
  "Dota 2",
] as const;

/**
 * Получить label для разрешения
 */
export function getResolutionLabel(resolution: "FHD" | "QHD" | "UHD4K"): string {
  const labels = {
    FHD: "Full HD (1080p)",
    QHD: "2K (1440p)",
    UHD4K: "4K (2160p)",
  };
  return labels[resolution];
}

/**
 * Получить короткий label для разрешения
 */
export function getResolutionShortLabel(resolution: "FHD" | "QHD" | "UHD4K"): string {
  const labels = {
    FHD: "1080p",
    QHD: "1440p",
    UHD4K: "4K",
  };
  return labels[resolution];
}
