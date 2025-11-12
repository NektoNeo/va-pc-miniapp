# 🔐 Руководство по авторизации админ-панели

## Текущее решение (Dev + Prod)

### 🛠️ Development режим (Сейчас)

**Авторизация отключена** для удобства разработки.

#### Как это работает:
- Middleware проверяет `NODE_ENV === "development"`
- Если true - **пропускает все запросы к `/admin/*` без проверки**
- `getSession()` возвращает фейковую mock сессию в DEV режиме
- Можно работать с админкой без логина/пароля

#### Настройка:
```bash
# apps/miniapp/.env.local
NODE_ENV=development
```

#### Доступ:
Просто открой: **http://localhost:3002/admin/pcs**

---

### 🚀 Production режим

**Полноценная JWT-авторизация** с защищённым доступом.

#### Как это работает:
1. Middleware проверяет `NODE_ENV !== "development"`
2. Все запросы к `/admin/*` требуют валидной JWT сессии
3. Без сессии → редирект на `/admin/login`
4. После входа → создаётся JWT токен в cookie `admin-session`

#### Настройка:
```bash
# .env.production (на сервере)
NODE_ENV=production
JWT_SECRET=<сгенерировать длинный случайный ключ минимум 32 символа>
DATABASE_URL=<production database>
```

#### Создание админа:

**Способ 1: Через seed (рекомендуется для первого админа)**
```bash
# Отредактируй prisma/seed.ts, измени credentials:
const adminPassword = await bcrypt.hash('ТвойСуперСложныйПароль!123', 10)

await prisma.adminUser.create({
  data: {
    email: 'твой-email@va-pc.ru',
    passwordHash: adminPassword,
    name: 'Твоё Имя',
    role: 'SUPER_ADMIN',
    active: true,
  },
})

# Запусти seed:
pnpm prisma db seed
```

**Способ 2: Через API (для дополнительных админов)**
После того как первый админ создан и ты залогинился, можно добавлять новых админов через админ-панель (будет реализовано в `/admin/users`).

**Способ 3: Прямой SQL (если что-то пошло не так)**
```sql
-- Сгенерируй хеш пароля:
-- Используй bcrypt онлайн генератор с cost 10
-- Например: https://bcrypt-generator.com/

INSERT INTO "AdminUser" (
  id,
  email,
  "passwordHash",
  name,
  role,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'твой-email@va-pc.ru',
  '$2a$10$...',  -- хеш пароля
  'Твоё Имя',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

---

## 🔒 Роли и права доступа

### SUPER_ADMIN
- **Полный доступ ко всему**
- Может создавать/удалять других админов
- Управление всеми настройками
- Доступ к статистике и логам

### ADMIN
- Управление PC Builds, Devices, Promotions
- Управление медиа-библиотекой
- Просмотр лидов (заявок)
- **НЕ может:** создавать/удалять админов

### MODERATOR
- **Только чтение** для лидов
- Ограниченное редактирование контента
- **НЕ может:** удалять данные, менять критичные настройки

---

## 📝 Логика в коде

### Middleware (apps/miniapp/middleware.ts)
```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Только admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // DEV MODE: Пропустить всё
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] DEV MODE: Bypassing auth");
    return NextResponse.next();
  }

  // PROD MODE: Проверка JWT
  const sessionCookie = request.cookies.get("admin-session");

  if (!sessionCookie?.value) {
    // Редирект на логин
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Верификация JWT токена
  const isValid = await verifySession(sessionCookie.value);

  if (!isValid) {
    // Невалидная сессия - очистить cookie и редирект
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin-session");
    return response;
  }

  // Всё ок - пропустить
  return NextResponse.next();
}
```

### Login API (apps/miniapp/app/api/admin/auth/login/route.ts)
```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Найти админа в БД
  const user = await db.adminUser.findUnique({
    where: { email },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Проверить пароль (bcrypt)
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Создать JWT сессию
  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Установить cookie
  await setSessionCookie(token);

  return NextResponse.json({ success: true, user });
}
```

---

## 🛡️ Безопасность в Production

### Обязательные меры:

1. **JWT_SECRET:**
   - Генерируй случайный ключ минимум 64 символа
   - **НИКОГДА** не коммить в Git
   - Храни в переменных окружения на сервере

2. **HTTPS:**
   - **ОБЯЗАТЕЛЬНО** используй HTTPS в продакшене
   - HTTP cookies с JWT небезопасны

3. **Password Policy:**
   - Минимум 12 символов
   - Заглавные + строчные + цифры + спецсимволы
   - Используй bcrypt cost 10-12 для хеширования

4. **Rate Limiting:**
   - Добавь ограничение на попытки входа (TODO)
   - Например: 5 попыток за 15 минут

5. **Session Duration:**
   - Токены истекают через 24 часа (настраивается)
   - После истечения - требуется повторный вход

6. **CSRF Protection:**
   - Middleware проверяет `x-csrf-token` для POST/PUT/PATCH/DELETE
   - Токен генерируется при входе

---

## 🚀 Deployment Checklist

Перед деплоем в продакшн убедись:

- [ ] `NODE_ENV=production` на сервере
- [ ] `JWT_SECRET` установлен (случайный, длинный)
- [ ] `DATABASE_URL` указывает на production БД
- [ ] HTTPS настроен и работает
- [ ] Создан первый SUPER_ADMIN через seed
- [ ] Сменён дефолтный пароль
- [ ] Rate limiting настроен
- [ ] Логирование работает
- [ ] Backup БД настроен

---

## 💡 Быстрые команды

### Development:
```bash
# Запустить dev сервер
pnpm run dev

# Админка откроется без логина
open http://localhost:3002/admin/pcs
```

### Production Setup:
```bash
# 1. Создать production БД
createdb vapc_production

# 2. Применить миграции
pnpm prisma migrate deploy

# 3. Создать админа через seed
pnpm prisma db seed

# 4. Запустить production сервер
pnpm run build
pnpm run start
```

---

## 📞 FAQ

**Q: Как изменить пароль админа?**
A: Сгенерируй новый bcrypt hash и обнови в БД:
```sql
UPDATE "AdminUser"
SET "passwordHash" = '$2a$10$новый_хеш'
WHERE email = 'твой-email@va-pc.ru';
```

**Q: Что делать если забыл пароль в продакшне?**
A: Создай новый временный пароль через SQL (см. выше) и смени его после входа.

**Q: Можно ли использовать OAuth/Google/GitHub логин?**
A: Да, можно добавить в будущем через NextAuth.js или аналогичные библиотеки.

**Q: Как добавить 2FA?**
A: TODO - планируется реализация через TOTP (Google Authenticator).

---

## 📊 Структура БД

### AdminUser таблица:
```prisma
model AdminUser {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  name          String
  role          AdminRole   @default(ADMIN)
  active        Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MODERATOR
}
```

---

Создано: 2025-11-11
Обновлено: 2025-11-11
Версия: 1.0
