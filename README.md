# VA-PC Telegram Mini App

Telegram Mini App для конфигуратора игровых ПК VA-PC, построенный на современном стеке технологий.

## 🚀 Стек технологий

### Frontend & Framework
- **Next.js 15.5.6** - React framework с App Router
- **React 19** - UI библиотека с Server Components
- **TypeScript 5** - Типизация
- **Tailwind CSS 4.1** - Utility-first CSS framework

### Мониторинг и Обсервабилити
- **Sentry for Next.js 10.22.0** ✅ - Error tracking, Performance monitoring, Session Replay

### Планируемые технологии
- **shadcn/ui (Radix)** - UI компоненты
- **@twa-dev/sdk** - Telegram WebApp API
- **TanStack Query v5** - Серверный стейт
- **Zustand v5** - Клиентский стейт
- **Telegraf v4** - Telegram бот (backend)
- **BullMQ + Redis** - Очереди и рассылки

## 📦 Установка и запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте переменные окружения

1. Создайте проект на [sentry.io](https://sentry.io)
2. Получите токен бота от [@BotFather](https://t.me/BotFather) в Telegram
3. Скопируйте `.env.example` в `.env.local`:
   ```bash
   cp apps/miniapp/.env.example apps/miniapp/.env.local
   ```
4. Заполните переменные окружения в `.env.local`:
   ```env
   # Sentry DSN
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@o0.ingest.sentry.io/your-id

   # Telegram Bot Token (для валидации initData)
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

Подробные инструкции по Sentry: [SENTRY_SETUP.md](./SENTRY_SETUP.md)

### 3. Запустите dev server

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🧪 Тестирование

### Тестирование Sentry

Перейдите на [http://localhost:3000/test-sentry](http://localhost:3000/test-sentry) для проверки интеграции Sentry.

Доступные тесты:
- Отправка обработанных ошибок
- Вызов необработанных ошибок
- Отправка сообщений

## 📁 Структура проекта

```
tg-final/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── global-error.tsx     # Global error handler
│   ├── globals.css          # Global styles
│   └── test-sentry/         # Sentry test page
├── instrumentation.ts       # Sentry instrumentation
├── sentry.client.config.ts  # Sentry client config
├── sentry.server.config.ts  # Sentry server config
├── sentry.edge.config.ts    # Sentry edge config
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🔧 Скрипты

```bash
npm run dev      # Запуск dev server с Turbopack
npm run build    # Production build
npm run start    # Запуск production server
npm run lint     # ESLint проверка
```

## 📊 Возможности Sentry

- ✅ **Error Tracking** - Автоматический мониторинг ошибок
- ✅ **Performance Monitoring** - Трассировка производительности
- ✅ **Session Replay** - Воспроизведение пользовательских сессий
- ✅ **User Feedback** - Встроенный виджет обратной связи
- ✅ **Source Maps** - Читаемые stack traces
- ✅ **React Annotations** - Подробный контекст компонентов

## 🔐 Безопасность

- Source maps загружаются в Sentry, но не публикуются
- Все секреты в `.env.local` (не коммитятся)
- `.env.example` содержит только примеры

## 📝 Лицензия

Private project

## 👨‍💻 Разработка

Проект находится в стадии начальной разработки. Следующие шаги:
- [ ] Интеграция с Telegram WebApp API
- [ ] Настройка shadcn/ui компонентов
- [ ] Реализация бизнес-логики конфигуратора
- [ ] Backend интеграция
- [ ] Деплой

---

Создано с помощью Next.js 15 и ❤️
