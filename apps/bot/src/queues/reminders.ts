import { Queue, Worker, QueueEvents } from 'bullmq';
import { Telegraf } from 'telegraf';
import type { ReminderJob } from '@vapc/shared';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const reminderQueue = new Queue<ReminderJob>('reminders', { connection });

// Generate unique job ID for reminders
export function jobId(userId: number, days: 3 | 7): string {
  return `reminder:${userId}:${days}d`;
}

// Add reminder job
export async function scheduleReminder(
  userId: number,
  days: 3 | 7,
  message?: string
) {
  await reminderQueue.add(
    'send-reminder',
    { userId, days, message },
    {
      jobId: jobId(userId, days),
      delay: days * 24 * 60 * 60 * 1000, // Convert days to milliseconds
      removeOnComplete: true,
      removeOnFail: 50,
    }
  );

  console.log(`📅 Scheduled ${days}-day reminder for user ${userId}`);
}

// Cancel all reminders for a user
export async function cancelReminders(userId: number): Promise<void> {
  await reminderQueue.remove(jobId(userId, 3));
  await reminderQueue.remove(jobId(userId, 7));
  console.log(`🚫 Cancelled reminders for user ${userId}`);
}

// Worker to process reminders
export function startReminderWorker(bot: Telegraf) {
  const worker = new Worker<ReminderJob>(
    'reminders',
    async (job) => {
      const { userId, days, message } = job.data;

      const defaultMessage =
        days === 3
          ? '👋 Привет! Прошло 3 дня с вашего последнего визита в VA-PC.\n\nНе забудьте проверить новые поступления игровых PC!'
          : '🎮 Прошла целая неделя!\n\nВ VA-PC появились новые конфигурации компьютеров. Загляните в каталог!';

      try {
        await bot.telegram.sendMessage(
          userId,
          message || defaultMessage,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🖥️ Открыть каталог',
                  web_app: { url: process.env.MINIAPP_URL! }
                }
              ]]
            }
          }
        );

        console.log(`✅ Sent ${days}-day reminder to user ${userId}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${userId}:`, error);
        throw error;
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Reminder job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Reminder job ${job?.id} failed:`, err);
  });

  // Queue events for monitoring
  const queueEvents = new QueueEvents('reminders', { connection });

  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`⏳ Job ${jobId} is waiting`);
  });

  queueEvents.on('active', ({ jobId }) => {
    console.log(`▶️ Job ${jobId} is active`);
  });

  return worker;
}
