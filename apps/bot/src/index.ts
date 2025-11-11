import { Telegraf } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
import { startReminderWorker, scheduleReminder, cancelReminders } from './queues/reminders.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);
const app = express();

// Middleware
app.use(express.json());

// Bot commands
bot.command('start', async (ctx) => {
  await ctx.reply(
    'Добро пожаловать в VA-PC! 🎮\n\n' +
    'Мы поможем вам собрать идеальный игровой компьютер.\n\n' +
    'Нажмите кнопку ниже, чтобы открыть каталог:',
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

  // Schedule reminders for +3 days and +7 days
  await scheduleReminder(ctx.from.id, 3);
  await scheduleReminder(ctx.from.id, 7);
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Доступные команды:\n\n' +
    '/start - Запустить бота\n' +
    '/help - Показать помощь\n' +
    '/catalog - Открыть каталог PC\n' +
    '/stop_reminders - Отключить напоминания\n' +
    '/channels - Наши каналы'
  );
});

bot.command('catalog', async (ctx) => {
  await ctx.reply(
    'Открыть каталог игровых PC:',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🖥️ Каталог VA-PC',
            web_app: { url: process.env.MINIAPP_URL! }
          }
        ]]
      }
    }
  );
});

bot.command('stop_reminders', async (ctx) => {
  await cancelReminders(ctx.from.id);
  await ctx.reply(
    '✅ Готово! Больше не будем напоминать о новых поступлениях.\n\n' +
    'Чтобы вернуть уведомления, используйте /start'
  );
});

bot.command('channels', async (ctx) => {
  await ctx.reply(
    'Наши официальные каналы:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🖥️ Сборки и новинки', url: process.env.VAPC_CHANNEL_BUILDS || 'https://t.me/vapc_builds' },
            { text: '📢 Новости и акции', url: process.env.VAPC_CHANNEL_NEWS || 'https://t.me/vapc_news' }
          ]
        ]
      }
    }
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Webhook setup
const webhookPath = '/telegram-webhook';
const port = Number(process.env.PORT) || 3001;

async function main() {
  try {
    const webhookDomain = process.env.WEBHOOK_DOMAIN;

    if (!webhookDomain) {
      throw new Error('WEBHOOK_DOMAIN not set');
    }

    // Start BullMQ reminder worker
    startReminderWorker(bot);
    console.log('🔄 Reminder worker started');

    // Create webhook callback
    const webhook = await bot.createWebhook({
      domain: webhookDomain,
      path: webhookPath,
    });

    app.use(webhook);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', uptime: process.uptime() });
    });

    app.listen(port, () => {
      console.log(`✅ Bot running on port ${port}`);
      console.log(`📡 Webhook: ${webhookDomain}${webhookPath}`);
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

main();
