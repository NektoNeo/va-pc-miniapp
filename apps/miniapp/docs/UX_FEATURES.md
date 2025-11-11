# UX Features Guide

Руководство по использованию UX утилит и хуков для улучшения пользовательского опыта в Admin Panel.

## 📋 Содержание

1. [Toast Notifications](#toast-notifications)
2. [Optimistic Updates](#optimistic-updates)
3. [Unsaved Changes Guard](#unsaved-changes-guard)
4. [Debounce Hook](#debounce-hook)
5. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## 🔔 Toast Notifications

Централизованная система уведомлений с единым стилем VA-PC dark theme.

### Импорт

```typescript
import { toast } from "@/lib/toast";
```

### Использование

#### Success Toast
```typescript
toast.success("Сборка создана");
toast.success("Сборка создана", "ID: 12345");
```

#### Error Toast
```typescript
toast.error("Не удалось сохранить");
toast.error("Не удалось сохранить", "Проверьте подключение");
```

#### Info/Warning Toast
```typescript
toast.info("Изменения будут применены через 5 минут");
toast.warning("Эта операция необратима");
```

#### Loading Toast
```typescript
const toastId = toast.loading("Загрузка...");
// После завершения операции
toast.dismiss(toastId);
toast.success("Загрузка завершена");
```

#### Promise Toast (автоматический)
```typescript
toast.promise(
  fetch('/api/admin/pcs').then(r => r.json()),
  {
    loading: 'Загрузка сборок...',
    success: (data) => `Загружено ${data.length} сборок`,
    error: 'Не удалось загрузить сборки'
  }
);
```

### Настройка темы

Toaster уже настроен в `app/admin/layout.tsx` с VA-PC темой:
- Background: `#1A1A1A`
- Border: `rgba(255, 255, 255, 0.1)`
- Position: `top-right`
- Theme: `dark`

---

## ⚡ Optimistic Updates

Hook для мгновенных UI обновлений до получения ответа сервера.

### Импорт

```typescript
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
// или
import { useOptimisticMutation } from "@/hooks";
```

### Пример: Удаление элемента

```typescript
function PCList() {
  const [pcs, setPCs] = useState([]);

  const { mutate: deletePC, isLoading } = useOptimisticMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pcs/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onMutate: (id) => {
      // Оптимистично удаляем из UI
      setPCs(prev => prev.filter(pc => pc.id !== id));
    },
    onSuccess: () => {
      // Обновляем данные с сервера
      fetchPCs();
    },
    onError: (error, id) => {
      // Откатываем изменения при ошибке
      fetchPCs();
    },
    messages: {
      loading: 'Удаление сборки...',
      success: 'Сборка удалена',
      error: 'Не удалось удалить сборку'
    }
  });

  return (
    <Button
      onClick={() => deletePC(pc.id)}
      disabled={isLoading}
    >
      Удалить
    </Button>
  );
}
```

### Пример: Создание элемента

```typescript
const { mutate: createPC } = useOptimisticMutation({
  mutationFn: async (data: PCInput) => {
    const res = await fetch('/api/admin/pcs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  onMutate: (data) => {
    // Добавляем временный элемент
    const tempPC = { id: 'temp-' + Date.now(), ...data };
    setPCs(prev => [...prev, tempPC]);
    return tempPC;
  },
  onSuccess: (result, variables, optimisticData) => {
    // Заменяем временный на реальный
    setPCs(prev => prev.map(pc =>
      pc.id === optimisticData.id ? result : pc
    ));
  },
  messages: {
    loading: 'Создание сборки...',
    success: 'Сборка создана',
    error: 'Не удалось создать сборку'
  }
});
```

### Пример: Обновление элемента

```typescript
const { mutate: updatePC } = useOptimisticMutation({
  mutationFn: async ({ id, data }: { id: string; data: PCInput }) => {
    const res = await fetch(`/api/admin/pcs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  onMutate: ({ id, data }) => {
    // Оптимистично обновляем UI
    setPCs(prev => prev.map(pc =>
      pc.id === id ? { ...pc, ...data } : pc
    ));
  },
  onSuccess: (result) => {
    // Обновляем с реальными данными сервера
    setPCs(prev => prev.map(pc =>
      pc.id === result.id ? result : pc
    ));
  },
  messages: {
    success: 'Сборка обновлена'
  }
});
```

---

## 🛡️ Unsaved Changes Guard

Предотвращает случайную потерю данных при навигации с несохраненными изменениями.

### Импорт

```typescript
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
// или
import { useUnsavedChanges } from "@/hooks";
```

### Использование с react-hook-form

```typescript
function PCEditForm() {
  const {
    formState: { isDirty },
    handleSubmit,
    reset
  } = useForm<PCInput>();

  // Автоматическая защита при закрытии вкладки
  useUnsavedChanges(isDirty);

  const onSubmit = async (data: PCInput) => {
    await savePC(data);
    reset(data); // Сбрасывает isDirty после сохранения
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* форма */}
    </form>
  );
}
```

### Ручная проверка при навигации

```typescript
function PCEditForm() {
  const router = useRouter();
  const { formState: { isDirty } } = useForm();

  const { confirmNavigation } = useUnsavedChanges(isDirty);

  const handleCancel = () => {
    if (confirmNavigation()) {
      router.push('/admin/pcs');
    }
  };

  return (
    <>
      <Button type="submit">Сохранить</Button>
      <Button variant="ghost" onClick={handleCancel}>
        Отмена
      </Button>
    </>
  );
}
```

### Кастомное сообщение

```typescript
useUnsavedChanges(
  isDirty,
  "У вас есть несохраненные изменения сборки. Покинуть страницу?"
);
```

---

## ⏱️ Debounce Hook

Откладывает обновление значения до окончания ввода (для поисков, автосохранения).

### Импорт

```typescript
import { useDebounce } from "@/hooks/use-debounce";
// или
import { useDebounce } from "@/hooks";
```

### Использование в поиске

```typescript
function SearchableList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // 500ms задержка

  useEffect(() => {
    // Вызывается только через 500ms после окончания ввода
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Поиск..."
    />
  );
}
```

### Использование в автосохранении

```typescript
function AutoSaveForm() {
  const [formData, setFormData] = useState({});
  const debouncedData = useDebounce(formData, 2000); // 2 секунды

  useEffect(() => {
    // Автосохранение через 2 сек после изменений
    if (Object.keys(debouncedData).length > 0) {
      saveDraft(debouncedData);
      toast.info("Черновик сохранен");
    }
  }, [debouncedData]);

  return <textarea onChange={(e) => setFormData({ content: e.target.value })} />;
}
```

---

## ⌨️ Keyboard Shortcuts

Горячие клавиши для ускорения работы в Admin Panel. Cross-platform поддержка (⌘ на Mac, Ctrl на Windows/Linux).

### Импорт

```typescript
import { useSaveShortcut, useKeyboardShortcut } from "@/hooks";
// или
import { useSaveShortcut, useKeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
```

### Save Shortcut (⌘S / Ctrl+S)

Универсальный хук для сохранения форм с помощью горячих клавиш.

#### Базовое использование

```typescript
function PCBuildForm() {
  const { handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await savePC(data);
  };

  // Добавляем keyboard shortcut
  useSaveShortcut(
    () => handleSubmit(onSubmit)(),
    isSubmitting
  );

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

#### С кастомным сообщением

```typescript
useSaveShortcut(
  () => handleSubmit(onSubmit)(),
  isSubmitting,
  "Сохранение сборки... (⌘S)"
);
```

#### Полный пример с react-hook-form

```typescript
function DeviceForm({ device }: { device: Device | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: device || { title: "", price: 0, badges: [] }
  });

  const onSubmit = async (data: DeviceFormData) => {
    setIsSubmitting(true);
    try {
      const url = device ? `/api/admin/devices/${device.id}` : "/api/admin/devices";
      const res = await fetch(url, {
        method: device ? "PATCH" : "POST",
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Девайс сохранён");
      router.push("/admin/devices");
    } catch (error) {
      toast.error("Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut: ⌘S / Ctrl+S
  useSaveShortcut(
    () => form.handleSubmit(onSubmit)(),
    isSubmitting,
    "Сохранение девайса... (⌘S)"
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* поля формы */}
        <Button type="submit" disabled={isSubmitting}>
          Сохранить
        </Button>
      </form>
    </Form>
  );
}
```

### Кастомные Keyboard Shortcuts

Для создания других горячих клавиш используйте базовый `useKeyboardShortcut` хук:

```typescript
// ⌘K для поиска
useKeyboardShortcut('k', () => {
  openSearchModal();
}, { meta: true });

// Ctrl+Shift+D для дублирования
useKeyboardShortcut('d', () => {
  duplicateCurrentItem();
}, { ctrl: true, shift: true });

// ⌘B для переключения жирности
useKeyboardShortcut('b', () => {
  toggleBold();
}, { meta: true });

// С disabled state
useKeyboardShortcut('s', () => {
  saveData();
}, {
  ctrl: true,
  meta: true,
  disabled: isSaving
});
```

### API Reference

#### `useSaveShortcut(onSave, disabled?, message?)`

- **onSave**: `() => void` - Функция сохранения
- **disabled**: `boolean` (опционально) - Отключить shortcut (например, во время `isSubmitting`)
- **message**: `string` (опционально) - Кастомное toast сообщение (по умолчанию "Сохранение... (⌘S)")

#### `useKeyboardShortcut(key, callback, options?)`

- **key**: `string` - Клавиша (например: `'s'`, `'k'`, `'Enter'`)
- **callback**: `() => void` - Функция при нажатии
- **options**: `object` (опционально)
  - `ctrl?: boolean` - Требовать Ctrl (Windows/Linux)
  - `meta?: boolean` - Требовать Cmd (Mac)
  - `shift?: boolean` - Требовать Shift
  - `alt?: boolean` - Требовать Alt
  - `disabled?: boolean` - Отключить shortcut

### Особенности реализации

- **Cross-platform**: Автоматическая поддержка ⌘ (Mac) и Ctrl (Windows/Linux)
- **preventDefault**: Блокирует browser default поведение (например, browser save dialog)
- **Toast уведомления**: `useSaveShortcut` автоматически показывает toast при срабатывании
- **Disabled state**: Shortcut не срабатывает если `disabled=true`
- **Cleanup**: Автоматическое удаление listener при unmount компонента

### Интеграция в формы

Все CRUD формы Admin Panel уже интегрированы с `useSaveShortcut`:

- ✅ PC Builds Form (`components/admin/pc-builds/pc-build-form.tsx`)
- ✅ Promotions Form (`components/admin/promos/promo-form.tsx`)
- ✅ Devices Form (`components/admin/devices/device-form.tsx`)
- ✅ Categories Form (`components/admin/categories/category-form.tsx`)

---

## 📱 Preview in Mini App

Компонент для предпросмотра сохраненных элементов в Telegram Mini App через deep-linking.

### Импорт

```typescript
import { PreviewButton } from "@/components/admin/preview-button";
```

### Использование

#### Базовый пример

```typescript
<PreviewButton
  entityType="pc"
  entityId={pcId}
/>
```

#### В форме редактирования

```typescript
function PCBuildForm({ initialData, isEdit }) {
  return (
    <div>
      {/* Форма */}

      {/* Кнопки */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleCancel}>
          Отмена
        </Button>

        <PreviewButton
          entityType="pc"
          entityId={isEdit && initialData ? initialData.id : null}
          variant="outline"
        />

        <Button type="submit">
          Сохранить
        </Button>
      </div>
    </div>
  );
}
```

### Props

- **entityType** (required): `"pc" | "promo" | "device" | "category"` - тип сущности
- **entityId** (required): `string | null` - ID элемента (null если не сохранен)
- **label**: `string` - текст кнопки (по умолчанию "Preview in Mini App")
- **variant**: кнопка variant (`"default" | "outline" | "ghost" | "secondary"`)
- **size**: размер кнопки (`"default" | "sm" | "lg" | "icon"`)
- **className**: дополнительные CSS классы

### Логика работы

1. **Disabled state**: Если `entityId === null`, кнопка неактивна с tooltip "Сохраните элемент перед предпросмотром"
2. **Deep-link генерация**: `https://t.me/{bot_username}/app?startapp={entityType}_{entityId}`
3. **Dialog с ссылкой**: При клике открывается диалог с preview ссылкой
4. **Copy to clipboard**: Кнопка для копирования ссылки в буфер обмена
5. **Toast уведомления**: Успех/ошибка при копировании

### Настройка окружения

Добавьте в `.env`:

```bash
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
```

### Примеры для разных сущностей

#### PC Builds

```typescript
<PreviewButton entityType="pc" entityId={pcBuild.id} />
```

#### Promotions

```typescript
<PreviewButton entityType="promo" entityId={promo.id} />
```

#### Devices

```typescript
<PreviewButton entityType="device" entityId={device.id} />
```

#### Categories

```typescript
<PreviewButton entityType="category" entityId={category.id} />
```

### Интеграция с Mini App

Mini App должен обработать `startParam` из Telegram.WebApp:

```typescript
// В Mini App
const startParam = Telegram.WebApp.initDataUnsafe.start_param;

if (startParam) {
  const [entityType, entityId] = startParam.split('_');

  // Роутинг на нужную страницу
  if (entityType === 'pc') {
    router.push(`/catalog/${entityId}`);
  } else if (entityType === 'promo') {
    router.push(`/promos/${entityId}`);
  }
  // и т.д.
}
```

---

## 📝 Примеры комбинирования

### Форма с полным UX

```typescript
function FullFeaturedForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset
  } = useForm<PCInput>();

  // Защита от потери данных
  const { confirmNavigation } = useUnsavedChanges(isDirty);

  // Автосохранение черновика
  const formValues = useWatch({ control });
  const debouncedValues = useDebounce(formValues, 3000);

  useEffect(() => {
    if (isDirty && debouncedValues) {
      localStorage.setItem('pc-draft', JSON.stringify(debouncedValues));
      toast.info("Черновик сохранен");
    }
  }, [debouncedValues, isDirty]);

  // Оптимистичное сохранение
  const { mutate: savePC, isLoading } = useOptimisticMutation({
    mutationFn: async (data: PCInput) => {
      const res = await fetch('/api/admin/pcs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (result) => {
      reset(result);
      localStorage.removeItem('pc-draft');
      router.push(`/admin/pcs/${result.id}`);
    },
    messages: {
      loading: 'Сохранение сборки...',
      success: 'Сборка создана',
      error: 'Не удалось создать сборку'
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => savePC(data))}>
      {/* поля формы */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Сохранение..." : "Сохранить"}
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          if (confirmNavigation()) {
            router.push('/admin/pcs');
          }
        }}
      >
        Отмена
      </Button>
    </form>
  );
}
```

---

## 🎨 Стилизация Toast

Toaster уже настроен с темой VA-PC в `app/admin/layout.tsx`:

```tsx
<Toaster
  position="top-right"
  richColors
  closeButton
  theme="dark"
  toastOptions={{
    style: {
      background: "#1A1A1A",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "white",
    },
  }}
/>
```

Цвета для типов:
- **Success**: зелёный (#10b981)
- **Error**: красный (#ef4444)
- **Warning**: жёлтый (#f59e0b)
- **Info**: синий (#3b82f6)
- **Loading**: фиолетовый (#9D4EDD) - VA-PC accent

---

## ✅ Чеклист интеграции

При создании новой формы/страницы:

- [ ] Использовать `toast` вместо прямого `import { toast } from "sonner"`
- [ ] Добавить `useUnsavedChanges(isDirty)` в формы редактирования
- [ ] Добавить `useDebounce` для поисковых полей (delay 500ms)
- [ ] Использовать `useOptimisticMutation` для DELETE/CREATE операций
- [ ] Проверить, что Toaster импортирован в layout.tsx (уже сделано)

---

## 🔗 Связанные файлы

- **Toast утилиты**: `lib/toast.ts`
- **Hooks**: `hooks/use-debounce.ts`, `hooks/use-unsaved-changes.ts`, `hooks/use-optimistic-mutation.ts`
- **Layout с Toaster**: `app/admin/layout.tsx`
- **Примеры использования**:
  - `components/admin/leads/leads-table.tsx` - useDebounce для search
  - `components/admin/media/media-card.tsx` - toast для уведомлений
  - `components/admin/media/media-gallery.tsx` - toast для уведомлений
