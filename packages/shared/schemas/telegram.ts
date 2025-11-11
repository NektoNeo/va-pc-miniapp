import { z } from "zod";

export const TelegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
  photo_url: z.string().url().optional(),
});

export const TelegramInitDataSchema = z.object({
  user: TelegramUserSchema.optional(),
  auth_date: z.number(),
  hash: z.string(),
  query_id: z.string().optional(),
  start_param: z.string().optional(),
});

export const ReminderJobSchema = z.object({
  userId: z.number(),
  days: z.union([z.literal(3), z.literal(7)]),
  message: z.string().optional(),
});
