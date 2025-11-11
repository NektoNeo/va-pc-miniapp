import { z } from "zod";

/**
 * Zod validation schema для Category форм
 */
export const categoryFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .max(60, "Максимум 60 символов")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  kind: z.enum(["PC", "DEVICE"], {
    required_error: "Выберите тип категории",
  }),
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  parentId: z
    .string()
    .cuid("Некорректный ID родительской категории")
    .optional()
    .nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

/**
 * Генерирует slug из названия категории с транслитерацией русских символов
 * @param title - Название категории
 * @returns URL-friendly slug
 */
export function generateCategorySlug(title: string): string {
  const translitMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return title
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => translitMap[char] || char)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
