# VA-PC Admin Panel - Руководство администратора

## 📋 Содержание

1. [Начало работы](#начало-работы)
2. [Вход в систему](#вход-в-систему)
3. [Управление сборками ПК](#управление-сборками-пк)
4. [Управление акциями](#управление-акциями)
5. [Настройки](#настройки)
6. [Медиа-библиотека](#медиа-библиотека)
7. [Категории и устройства](#категории-и-устройства)
8. [Лиды](#лиды)
9. [Горячие клавиши](#горячие-клавиши)
10. [Troubleshooting](#troubleshooting)

---

## Начало работы

### Требования для разработки

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+
- Redis 6+ (для BullMQ)

### Установка

```bash
# 1. Установить зависимости
cd apps/miniapp
pnpm install

# 2. Настроить .env.local
cp .env.example .env.local
# Обязательно установите:
# - DATABASE_URL
# - JWT_SECRET (минимум 32 символа)
# - REDIS_HOST, REDIS_PORT

# 3. Запустить миграции
pnpm db:migrate

# 4. Создать seed данные (включая тестового админа)
pnpm db:seed

# 5. Запустить dev сервер
pnpm dev
```

### Тестовый админ (создаётся через seed)

- **Email**: `test@va-pc.ru`
- **Пароль** задаётся через серверную переменную `ADMIN_BOOTSTRAP_PASSWORD` (16 символов и более, до 72 байт). Для другого адреса задайте `ADMIN_BOOTSTRAP_EMAIL`. Существующие аккаунты сохраняются. Тестовый seed предназначен только для локальной базы.
- **Роль**: SUPER_ADMIN

---

## Вход в систему

### URL админ-панели

```
http://localhost:3001/admin
```

При первом входе на `/admin` вы будете перенаправлены на `/admin/auth/login`.

### Процесс аутентификации

1. Введите email и пароль
2. После успешной авторизации создается JWT-токен сессии
3. Сессия хранится в httpOnly cookie
4. Длительность сессии: 7 дней

### Управление доступом

**Роли администраторов**:

- `SUPER_ADMIN` - полный доступ ко всем функциям
- `ADMIN` - ограниченный доступ (в будущих версиях)

**Middleware защита**:

Все `/admin/*` роуты защищены middleware, который проверяет:
1. Наличие сессии (JWT cookie)
2. Валидность токена
3. Активность пользователя (`active: true`)

---

## Управление сборками ПК

### Создание новой сборки

**Навигация**: `Admin Panel → PC Builds → Create New`

**Обязательные поля**:

- **Название** (title) - отображается пользователям
- **Описание** (description) - краткое описание сборки
- **Категория** (category) - Gaming, Workstation, Budget и т.д.
- **Цена** (finalPrice) - финальная цена после применения акций
- **Активность** (active) - включить/выключить видимость в мини-приложении

**Компоненты**:

Для каждой сборки добавьте компоненты из выпадающего списка:

- CPU (процессор)
- GPU (видеокарта)
- RAM (оперативная память)
- Storage (накопитель)
- Motherboard (материнская плата)
- Power Supply (блок питания)
- Cooling (система охлаждения)
- Case (корпус)

**Медиа**:

- Загрузите изображение сборки через Media Picker
- Автоматически генерируется blurhash для плавной загрузки

**Автосохранение**:

- Используйте `⌘S` (macOS) или `Ctrl+S` (Windows) для быстрого сохранения
- Всплывающее уведомление при попытке покинуть страницу с несохранёнными изменениями

### FPS Metrics

Для игровых сборок добавьте FPS метрики:

1. Перейдите на вкладку "FPS Metrics"
2. Выберите игру и разрешение
3. Укажите FPS для разных настроек качества:
   - Ultra (ультра)
   - High (высокие)
   - Medium (средние)
   - Low (низкие)

### Предпросмотр в Mini App

Используйте кнопку "Preview in Mini App" для проверки:

- Открывает Telegram Mini App в режиме draft
- Показывает как сборка будет выглядеть для пользователей
- Не требует публикации изменений

---

## Управление акциями

### Создание акции

**Навигация**: `Admin Panel → Promotions → Create New`

**Параметры акции**:

1. **Базовая информация**:
   - Slug (URL-friendly ID)
   - Название
   - Описание
   - Активность

2. **Временной период**:
   - Дата начала (startsAt)
   - Дата окончания (endsAt)

3. **Скидка**:
   - Процент скидки (discountPercent)
   - Максимальная скидка в рублях (maxDiscountAmount)

4. **Правила применения**:
   - Минимальная цена (minPrice)
   - Максимальная цена (maxPrice)
   - Категории (categories) - выбор нескольких категорий
   - Конкретные сборки (pcBuildIds) - ID конкретных сборок

### Preview Affected Items

При создании/редактировании акции панель автоматически показывает:

- Количество затронутых сборок
- Список сборок с новыми ценами
- Расчёт экономии для пользователя

**Пример**:

```
Оригинальная цена: 150,000 ₽
Скидка 15%: -22,500 ₽
Финальная цена: 127,500 ₽
```

### Приоритет акций

Если на сборку распространяются несколько акций:

1. Применяется акция с наибольшей скидкой
2. Учитывается maxDiscountAmount
3. Отображается badge с процентом скидки

---

## Настройки

### Top-4 PC Builds

**Drag-and-Drop редактор**:

1. Перейдите в `Settings → Top-4 Builds`
2. Перетащите сборки для изменения порядка
3. Нажмите "Save" для применения

**Отображение в Mini App**:

- Top-4 показываются на главной странице
- Используются для "Популярные сборки"
- Автоматически обновляются при сохранении

### Budget Presets

Редактор диапазонов бюджета для фильтрации:

```json
{
  "budget_low": "50000-100000",
  "budget_mid": "100000-200000",
  "budget_high": "200000-500000"
}
```

### Telegraph Links

Управление ссылками на юридические документы:

- Privacy Policy (Политика конфиденциальности)
- Public Offer (Публичная оферта)
- Personal Data Consent (Согласие на обработку ПД)
- Review Consent (Согласие на публикацию отзывов)
- FAQ

**Формат**: `https://telegra.ph/[slug]`

---

## Медиа-библиотека

### Загрузка изображений

**Поддерживаемые форматы**:

- PNG, JPEG, WEBP
- Максимальный размер: 10 MB
- Рекомендуемое разрешение: 1920x1080 или выше

**Процесс загрузки**:

1. Drag-and-drop файлов или клик для выбора
2. Автоматическая оптимизация изображения
3. Генерация blurhash для preview
4. Сохранение в S3 (или локально для dev)

### Организация медиа

- **Фильтры**: По типу файла, дате загрузки
- **Поиск**: По имени файла
- **Сортировка**: По дате, имени, размеру
- **Удаление**: Bulk delete для множественного выбора

### Использование в формах

Media Picker автоматически интегрируется в формы:

```tsx
<MediaPicker
  value={selectedMedia}
  onChange={handleMediaChange}
  multiple={false}
/>
```

---

## Категории и устройства

### Управление категориями

**Иерархическая структура**:

```
Gaming (parent)
  ├─ Entry Gaming (child)
  ├─ Mid-Range Gaming (child)
  └─ High-End Gaming (child)
```

**Создание категории**:

1. Название (name)
2. Slug (URL-friendly, автогенерируется)
3. Parent Category (опционально)
4. Порядок отображения (displayOrder)

### Управление устройствами

Устройства - это комплектующие которые входят в сборки:

**Типы устройств**:

- CPU
- GPU
- RAM
- Storage
- Motherboard
- PSU (Power Supply)
- Cooling
- Case

**Параметры устройства**:

- Название
- Производитель
- Модель
- Спецификации (JSON)
- Цена
- Изображение

---

## Лиды

### Просмотр лидов

**Навигация**: `Admin Panel → Leads`

**Read-only таблица** с информацией о заявках:

- ID лида
- Telegram User ID
- Выбранная сборка
- Контактная информация (если предоставлена)
- Статус (new, contacted, converted, closed)
- Дата создания

**Фильтры**:

- По статусу
- По дате
- По сборке
- По источнику (mini app, website)

**Экспорт**:

- CSV экспорт для CRM систем
- Includes: user_id, build_id, contact, status, created_at

---

## Горячие клавиши

### Глобальные

- `⌘K` / `Ctrl+K` - Command Palette (быстрый поиск)
- `⌘/` / `Ctrl+/` - Toggle sidebar

### В формах

- `⌘S` / `Ctrl+S` - Save (сохранить)
- `⌘Enter` / `Ctrl+Enter` - Submit form (отправить форму)
- `Esc` - Close dialog/modal

### В таблицах

- `↑↓` - Navigate rows
- `Space` - Select row
- `⌘A` / `Ctrl+A` - Select all

---

## Troubleshooting

### Проблемы с авторизацией

**"Invalid credentials"**:

- Проверьте правильность email/пароля
- Убедитесь что пользователь `active: true` в БД
- Проверьте что `JWT_SECRET` установлен в `.env.local`

**"Session expired"**:

- Сессия истекла через 7 дней
- Выполните re-login

### Проблемы с Prisma

**"@prisma/client did not initialize yet"**:

```bash
# Сгенерировать Prisma Client
pnpm db:generate

# Или запустить dev сервер (автоматически генерирует)
pnpm dev
```

**Ошибки миграций**:

```bash
# Сбросить базу и применить миграции заново
pnpm db:reset

# Создать seed данные
pnpm db:seed
```

### Проблемы с медиа

**Изображения не загружаются**:

- Проверьте настройки S3 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- Для локальной разработки: убедитесь что `./uploads` директория существует
- Проверьте permissions на директорию uploads

**Blurhash не генерируется**:

- Убедитесь что Sharp установлен: `pnpm list sharp`
- Переустановите Sharp: `pnpm add -D sharp`

### Performance Issues

**Медленная загрузка таблиц**:

- Включите pagination в DataTable
- Оптимизируйте Prisma queries с `select` и `include`
- Добавьте database indexes для часто используемых полей

**Медленный Next.js dev server**:

- Используйте Turbopack: `pnpm dev --turbopack` (уже в package.json)
- Очистите `.next` кэш: `rm -rf .next`

---

## API Endpoints

### Authentication

```
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/session
```

### PC Builds

```
GET    /api/admin/pcs
POST   /api/admin/pcs
GET    /api/admin/pcs/[id]
PATCH  /api/admin/pcs/[id]
DELETE /api/admin/pcs/[id]
```

### Promotions

```
GET    /api/admin/promos
POST   /api/admin/promos
PATCH  /api/admin/promos/[id]
DELETE /api/admin/promos/[id]
GET    /api/admin/promos/preview
```

### Settings

```
GET   /api/admin/settings
PATCH /api/admin/settings
```

### Media

```
POST   /api/admin/media/upload
GET    /api/admin/media
DELETE /api/admin/media/[id]
```

### Categories

```
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/[id]
DELETE /api/admin/categories/[id]
```

### Devices

```
GET    /api/admin/devices
POST   /api/admin/devices
PATCH  /api/admin/devices/[id]
DELETE /api/admin/devices/[id]
```

### Leads

```
GET /api/admin/leads
GET /api/admin/leads/export
```

---

## Security Best Practices

### JWT Secret

- Используйте **криптографически случайный** ключ минимум 32 символа
- Генерация: `openssl rand -base64 32`
- **НИКОГДА** не коммитьте JWT_SECRET в git

### Password Management

- Минимальная длина пароля: 8 символов
- Обязательные требования: заглавные, строчные, цифры, спецсимволы
- Хеширование: bcrypt с salt rounds = 10

### CORS и CSRF

- Admin API доступен только с same-origin requests
- CSRF protection через SameSite cookies
- httpOnly cookies для session токенов

### Monitoring

Все admin actions логируются в Sentry с тегами:

```typescript
{
  adminId: string
  route: string
  feature: string
  action: string
}
```

---

## Support

### Документация

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [Zod Validation](https://zod.dev)
- [Shadcn/ui](https://ui.shadcn.com)

### Контакты

- Technical Support: [support@va-pc.ru](mailto:support@va-pc.ru)
- GitHub Issues: [tg-final/issues](https://github.com/va-pc/tg-final/issues)

---

**Версия документа**: 1.0.0
**Последнее обновление**: 2025-11-03
