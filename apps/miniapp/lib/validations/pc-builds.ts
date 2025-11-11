import { z } from "zod";

/**
 * Zod Validation Schemas для PC Builds
 * Используется в:
 * - API routes для валидации request body
 * - React Hook Form для форм создания/редактирования
 * - Query параметров для фильтрации
 */

// ============================================================================
// ENUMS
// ============================================================================

export const ResolutionEnum = z.enum(["FHD", "QHD", "UHD4K"], {
  errorMap: () => ({ message: "Выберите разрешение: FHD, QHD или UHD4K" }),
});

export const AvailabilityEnum = z.enum(["IN_STOCK", "PREORDER", "OUT_OF_STOCK"], {
  errorMap: () => ({ message: "Выберите статус: В наличии, Предзаказ или Нет в наличии" }),
});

// ============================================================================
// SPEC SCHEMA (Характеристики железа)
// ============================================================================

export const pcSpecSchema = z.object(
  {
    cpu: z
      .string({ required_error: "Процессор обязателен" })
      .min(3, "Минимум 3 символа")
      .max(100, "Максимум 100 символов"),
    gpu: z
      .string({ required_error: "Видеокарта обязательна" })
      .min(3, "Минимум 3 символа")
      .max(100, "Максимум 100 символов"),
    ram: z
      .string({ required_error: "Оперативная память обязательна" })
      .min(2, "Минимум 2 символа")
      .max(50, "Максимум 50 символов"),
    ssd: z
      .string({ required_error: "Накопитель обязателен" })
      .min(2, "Минимум 2 символа")
      .max(100, "Максимум 100 символов"),
    motherboard: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(100, "Максимум 100 символов")
      .optional(),
    psu: z
      .string()
      .min(2, "Минимум 2 символа")
      .max(50, "Максимум 50 символов")
      .optional(),
    cooling: z
      .string()
      .min(2, "Минимум 2 символа")
      .max(100, "Максимум 100 символов")
      .optional(),
    case: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(100, "Максимум 100 символов")
      .optional(),
  },
  {
    required_error: "Характеристики обязательны",
    invalid_type_error: "Некорректный формат характеристик",
  }
);

// ============================================================================
// OPTIONS SCHEMA (Конфигурируемые опции)
// ============================================================================

export const optionVariantSchema = z.object({
  label: z
    .string({ required_error: "Название варианта обязательно" })
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов"),
  sizeGb: z
    .number({ invalid_type_error: "Размер должен быть числом" })
    .int("Размер должен быть целым числом")
    .positive("Размер должен быть положительным")
    .optional(),
  delta: z
    .number({ required_error: "Дельта цены обязательна" })
    .int("Дельта должна быть целым числом"),
});

export const pcOptionsSchema = z
  .object({
    ram: z
      .array(optionVariantSchema)
      .min(1, "Минимум 1 вариант RAM")
      .max(5, "Максимум 5 вариантов RAM")
      .optional(),
    ssd: z
      .array(optionVariantSchema)
      .min(1, "Минимум 1 вариант SSD")
      .max(5, "Максимум 5 вариантов SSD")
      .optional(),
    gpu: z
      .array(optionVariantSchema)
      .max(5, "Максимум 5 вариантов GPU")
      .optional(),
    cooling: z
      .array(optionVariantSchema)
      .max(5, "Максимум 5 вариантов охлаждения")
      .optional(),
  })
  .optional();

// ============================================================================
// CREATE PC BUILD SCHEMA
// ============================================================================

export const createPCBuildSchema = z.object({
  // Обязательные поля
  slug: z
    .string({ required_error: "Slug обязателен" })
    .min(3, "Минимум 3 символа")
    .max(100, "Максимум 100 символов")
    .regex(/^[a-z0-9-]+$/, "Только строчные буквы, цифры и дефисы"),

  title: z
    .string({ required_error: "Название обязательно" })
    .min(5, "Минимум 5 символов")
    .max(100, "Максимум 100 символов"),

  subtitle: z
    .string()
    .max(200, "Максимум 200 символов")
    .optional(),

  coverImageId: z
    .string()
    .min(1, "ID изображения обязателен")
    .optional(),
    // TODO: Restore .cuid() validation after implementing proper media selection API

  videoId: z
    .string()
    .cuid("Некорректный ID видео")
    .optional(),

  gallery: z
    .array(z.string().cuid("Некорректный ID изображения"))
    .max(10, "Максимум 10 изображений в галерее")
    .optional(),

  priceBase: z
    .number({ required_error: "Цена обязательна" })
    .int("Цена должна быть целым числом")
    .min(10000, "Минимальная цена 10,000 ₽")
    .max(10000000, "Максимальная цена 10,000,000 ₽"),

  targets: z
    .array(ResolutionEnum)
    .min(1, "Выберите хотя бы одно разрешение")
    .max(3, "Максимум 3 разрешения"),

  spec: pcSpecSchema,

  options: pcOptionsSchema.optional(),

  // Опциональные поля
  isTop: z.boolean().optional(),

  badges: z
    .array(z.string().min(1).max(20))
    .max(5, "Максимум 5 бейджей")
    .optional(),

  availability: AvailabilityEnum.optional(),
});

// ============================================================================
// UPDATE PC BUILD SCHEMA
// ============================================================================

export const updatePCBuildSchema = createPCBuildSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Необходимо указать хотя бы одно поле для обновления",
  });

// ============================================================================
// QUERY SCHEMA (Фильтрация и пагинация)
// ============================================================================

export const pcBuildQuerySchema = z.object({
  // Поиск
  search: z.string().optional(),

  // Фильтры по цене
  minPrice: z.coerce
    .number()
    .int("Цена должна быть целым числом")
    .positive("Цена должна быть положительной")
    .optional(),

  maxPrice: z.coerce
    .number()
    .int("Цена должна быть целым числом")
    .positive("Цена должна быть положительной")
    .optional(),

  // Фильтры по разрешению
  targets: z
    .array(ResolutionEnum)
    .optional()
    .or(ResolutionEnum.transform((val) => [val])), // Поддержка одиночного значения

  // Фильтр по доступности
  availability: AvailabilityEnum.optional(),

  // Фильтр по топовым
  isTop: z.coerce.boolean().optional(),

  // Пагинация
  page: z.coerce
    .number()
    .int("Номер страницы должен быть целым числом")
    .positive("Номер страницы должен быть положительным")
    .default(1),

  limit: z.coerce
    .number()
    .int("Лимит должен быть целым числом")
    .positive("Лимит должен быть положительным")
    .max(100, "Максимальный лимит 100")
    .default(10),

  // Сортировка
  sortBy: z.enum(["price", "title", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.maxPrice > data.minPrice;
    }
    return true;
  },
  {
    message: "Максимальная цена должна быть больше минимальной",
    path: ["maxPrice"],
  }
);

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type PCSpec = z.infer<typeof pcSpecSchema>;
export type OptionVariant = z.infer<typeof optionVariantSchema>;
export type PCOptions = z.infer<typeof pcOptionsSchema>;
export type CreatePCBuildInput = z.infer<typeof createPCBuildSchema>;
export type UpdatePCBuildInput = z.infer<typeof updatePCBuildSchema>;
export type PCBuildQuery = z.infer<typeof pcBuildQuerySchema>;
export type Resolution = z.infer<typeof ResolutionEnum>;
export type Availability = z.infer<typeof AvailabilityEnum>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Генерирует URL-friendly slug из заголовка
 *
 * @param title - Заголовок PC Build
 * @returns kebab-case slug
 *
 * @example
 * generateSlug("Игровой ПК RTX 4070") // "igrovoy-pk-rtx-4070"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Разделяет символы и диакритические знаки
    .replace(/[\u0300-\u036f]/g, "") // Удаляет диакритические знаки
    .replace(/[а-яё]/g, (char) => {
      // Транслитерация кириллицы
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, "") // Удаляет недопустимые символы
    .replace(/\s+/g, "-") // Заменяет пробелы на дефисы
    .replace(/-+/g, "-") // Удаляет повторяющиеся дефисы
    .replace(/^-|-$/g, "") // Удаляет дефисы в начале и конце
    .trim();
}

/**
 * Форматирует цену в рубли
 *
 * @param price - Цена в копейках или рублях
 * @returns Отформатированная строка с валютой
 *
 * @example
 * formatPrice(150000) // "150 000 ₽"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Парсит spec из строки JSON
 *
 * @param specJson - JSON строка с характеристиками
 * @returns Валидированный объект PCSpec
 */
export function parseSpec(specJson: string): PCSpec {
  try {
    const parsed = JSON.parse(specJson);
    return pcSpecSchema.parse(parsed);
  } catch (error) {
    throw new Error("Некорректный формат характеристик");
  }
}

/**
 * Парсит options из строки JSON
 *
 * @param optionsJson - JSON строка с опциями
 * @returns Валидированный объект PCOptions
 */
export function parseOptions(optionsJson: string): PCOptions {
  try {
    const parsed = JSON.parse(optionsJson);
    return pcOptionsSchema.parse(parsed);
  } catch (error) {
    throw new Error("Некорректный формат опций");
  }
}
