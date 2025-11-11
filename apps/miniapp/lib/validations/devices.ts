import { z } from "zod";

/**
 * Zod schema для формы создания/редактирования девайса
 */
export const deviceFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .max(60, "Максимум 60 символов")
    .regex(/^[a-z0-9-]+$/, "Только латинские буквы, цифры и дефисы"),

  categoryId: z
    .string()
    .cuid("Некорректный ID категории"),

  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),

  price: z
    .number()
    .int("Цена должна быть целым числом")
    .positive("Цена должна быть положительной")
    .min(100, "Минимальная цена 100₽")
    .max(9999999, "Максимальная цена 9,999,999₽"),

  coverImageId: z
    .string()
    .cuid("Некорректный ID изображения")
    .optional(), // Опционально, пока нет Media Library (Task 22)

  badges: z
    .array(z.string().min(1).max(20))
    .default([]),

  isTop: z
    .boolean()
    .default(false),
});

export type DeviceFormData = z.infer<typeof deviceFormSchema>;

/**
 * Генерация slug из названия девайса
 * @example generateDeviceSlug("Клавиатура HyperX Alloy FPS Pro") => "klaviatura-hyperx-alloy-fps-pro"
 */
export function generateDeviceSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Транслитерация русских букв
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "g")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/ё/g, "yo")
    .replace(/ж/g, "zh")
    .replace(/з/g, "z")
    .replace(/и/g, "i")
    .replace(/й/g, "y")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "h")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "sch")
    .replace(/ъ/g, "")
    .replace(/ы/g, "y")
    .replace(/ь/g, "")
    .replace(/э/g, "e")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya")
    // Удаление небуквенно-нецифровых символов
    .replace(/[^a-z0-9\s-]/g, "")
    // Замена пробелов на дефисы
    .replace(/\s+/g, "-")
    // Удаление повторяющихся дефисов
    .replace(/-+/g, "-")
    // Удаление дефисов в начале и конце
    .replace(/^-|-$/g, "")
    // Ограничение длины
    .slice(0, 60);
}

/**
 * Форматирование цены для отображения
 * @example formatPrice(150000) => "150 000₽"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")}₽`;
}
