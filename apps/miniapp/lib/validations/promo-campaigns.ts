import { z } from "zod";

/**
 * Promo Campaign Rules Types
 */
export const promoRuleTypes = ["percentOff", "fixedOff", "fixedPrice"] as const;
export type PromoRuleType = (typeof promoRuleTypes)[number];

/**
 * Promo Campaign Rules Schema
 */
export const promoCampaignRulesSchema = z.object({
  type: z.enum(promoRuleTypes, {
    errorMap: () => ({
      message: "Выберите тип скидки: процент, фиксированная сумма или конечная цена",
    }),
  }),

  value: z
    .number()
    .int("Значение должно быть целым числом")
    .positive("Значение должно быть положительным"),

  minPrice: z
    .number()
    .int("Минимальная цена должна быть целым числом")
    .positive("Минимальная цена должна быть положительной")
    .optional(),

  maxPrice: z
    .number()
    .int("Максимальная цена должна быть целым числом")
    .positive("Максимальная цена должна быть положительной")
    .optional(),

  tags: z.array(z.string()).optional(),
});

/**
 * Promo Campaign Form Schema
 */
export const promoCampaignFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Название обязательно")
      .max(100, "Максимум 100 символов"),

    slug: z
      .string()
      .min(1, "Slug обязателен")
      .max(60, "Максимум 60 символов")
      .regex(
        /^[a-z0-9-]+$/,
        "Только маленькие буквы, цифры и дефисы (kebab-case)"
      ),

    description: z
      .string()
      .max(500, "Максимум 500 символов")
      .optional()
      .or(z.literal("")),

    active: z.boolean().default(false),

    startsAt: z.coerce.date({
      errorMap: () => ({
        message: "Укажите дату начала промо-кампании",
      }),
    }),

    endsAt: z.coerce
      .date({
        errorMap: () => ({
          message: "Укажите корректную дату окончания",
        }),
      })
      .optional()
      .nullable(),

    bannerImageId: z.string().cuid("Некорректный ID изображения").optional(),

    rules: promoCampaignRulesSchema,

    priority: z
      .number()
      .int("Приоритет должен быть целым числом")
      .min(0, "Приоритет не может быть отрицательным")
      .max(999, "Максимальный приоритет: 999")
      .default(0),
  })
  .refine(
    (data) => {
      // Если endsAt указан, он должен быть позже startsAt
      if (data.endsAt && data.startsAt) {
        return data.endsAt > data.startsAt;
      }
      return true;
    },
    {
      message: "Дата окончания должна быть позже даты начала",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      // Если указаны minPrice и maxPrice, max должен быть больше min
      if (data.rules.minPrice && data.rules.maxPrice) {
        return data.rules.maxPrice > data.rules.minPrice;
      }
      return true;
    },
    {
      message: "Максимальная цена должна быть больше минимальной",
      path: ["rules.maxPrice"],
    }
  )
  .refine(
    (data) => {
      // Для процентной скидки значение должно быть от 1 до 99
      if (data.rules.type === "percentOff") {
        return data.rules.value >= 1 && data.rules.value <= 99;
      }
      return true;
    },
    {
      message: "Процент скидки должен быть от 1% до 99%",
      path: ["rules.value"],
    }
  );

/**
 * Type inference для формы
 */
export type PromoCampaignFormData = z.infer<typeof promoCampaignFormSchema>;

/**
 * Helper: Генерация slug из title
 */
export function generatePromoSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Helper: Форматирование правила для отображения
 */
export function formatPromoRule(
  type: PromoRuleType,
  value: number
): string {
  switch (type) {
    case "percentOff":
      return `-${value}%`;
    case "fixedOff":
      return `-${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
    case "fixedPrice":
      return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
  }
}

/**
 * Helper: Описание типа скидки
 */
export function getPromoTypeLabel(type: PromoRuleType): string {
  switch (type) {
    case "percentOff":
      return "Процент от цены";
    case "fixedOff":
      return "Фиксированная скидка";
    case "fixedPrice":
      return "Конечная цена";
  }
}

/**
 * Helper: Вычисление финальной цены с учётом промо
 */
export function calculatePromoPrice(
  originalPrice: number,
  rules: z.infer<typeof promoCampaignRulesSchema>
): number | null {
  const { type, value, minPrice, maxPrice } = rules;

  // Проверка диапазона цен
  if (minPrice && originalPrice < minPrice) return null;
  if (maxPrice && originalPrice > maxPrice) return null;

  switch (type) {
    case "percentOff":
      return Math.round(originalPrice * (1 - value / 100));
    case "fixedOff":
      return Math.max(0, originalPrice - value);
    case "fixedPrice":
      return value;
  }
}
