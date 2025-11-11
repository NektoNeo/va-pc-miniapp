# Sentry Setup Instructions

## Установка завершена ✅

Sentry для Next.js 15 успешно установлен и настроен.

## Что было настроено

### 1. Установленные пакеты
- `@sentry/nextjs@10.22.0` - официальный SDK для Next.js

### 2. Конфигурационные файлы
- ✅ `sentry.client.config.ts` - клиентская конфигурация с Session Replay
- ✅ `sentry.server.config.ts` - серверная конфигурация
- ✅ `sentry.edge.config.ts` - конфигурация для Edge Runtime
- ✅ `instrumentation.ts` - инициализация Sentry при запуске приложения
- ✅ `next.config.ts` - интеграция с Next.js через `withSentryConfig`
- ✅ `app/global-error.tsx` - глобальный обработчик ошибок

### 3. Переменные окружения
- ✅ `.env.local` - локальная конфигурация (не коммитится)
- ✅ `.env.example` - пример конфигурации для команды

## Следующие шаги

### 1. Создайте проект в Sentry

1. Перейдите на [sentry.io](https://sentry.io)
2. Создайте аккаунт (если нет) или войдите
3. Создайте новый проект:
   - Platform: **Next.js**
   - Project name: **tg-final** (или ваше название)
4. Скопируйте **DSN** из настроек проекта

### 2. Настройте переменные окружения

Откройте `.env.local` и заполните:

```bash
# Обязательно
NEXT_PUBLIC_SENTRY_DSN=https://ваш-ключ@o0.ingest.sentry.io/ваш-id

# Опционально (для загрузки source maps)
SENTRY_ORG=ваш-org-slug
SENTRY_PROJECT=ваш-project-slug
SENTRY_AUTH_TOKEN=ваш-auth-token
```

**Где найти:**
- DSN: Settings → Projects → [Ваш проект] → Client Keys (DSN)
- ORG: Settings → General Settings → Organization Slug
- PROJECT: Settings → Projects → [Ваш проект] → General Settings
- AUTH_TOKEN: Settings → Auth Tokens → Create New Token (с правами `project:releases`)

### 3. Протестируйте интеграцию

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

Для тестирования ошибок:
1. Откройте браузерную консоль
2. Вызовите тестовую ошибку:
   ```javascript
   throw new Error("Sentry Test Error");
   ```
3. Проверьте в Sentry Dashboard наличие ошибки

## Возможности Sentry

### ✨ Что уже работает:

- **Error Tracking** - автоматический мониторинг ошибок
- **Performance Monitoring** - трассировка производительности (100% транзакций)
- **Session Replay** - воспроизведение сессий пользователей
  - 10% всех сессий
  - 100% сессий с ошибками
- **User Feedback** - встроенный виджет обратной связи
- **Source Maps** - читаемые стэк-трейсы в production
- **React Component Annotations** - подробный контекст React компонентов

### 📊 Performance Settings

Текущие настройки оптимизированы для разработки:
- `tracesSampleRate: 1.0` - 100% транзакций
- `replaysSessionSampleRate: 0.1` - 10% обычных сессий
- `replaysOnErrorSampleRate: 1.0` - 100% сессий с ошибками

**Для production** рекомендуется:
```typescript
tracesSampleRate: 0.1, // 10% транзакций
replaysSessionSampleRate: 0.01, // 1% сессий
```

## MCP Sentry Integration

Проект также готов к интеграции с **MCP Sentry** для Claude Code:
- Автоматический анализ ошибок через Claude
- Генерация фиксов на основе stack traces
- Мониторинг через MCP tools

## Документация

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)

## Поддержка

Если возникнут вопросы:
- [Sentry Discord](https://discord.gg/sentry)
- [GitHub Issues](https://github.com/getsentry/sentry-javascript/issues)
