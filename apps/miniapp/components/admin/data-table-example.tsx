/**
 * Пример использования DataTable компонента
 *
 * Этот файл показывает как использовать DataTable для создания таблиц
 * с данными в Admin Panel. Компонент полностью типизирован и поддерживает
 * все необходимые функции для работы с данными.
 */

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

// 1. Определяем тип данных
type PCBuild = {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: Date;
};

// 2. Создаём колонки с типами
const columns: ColumnDef<PCBuild>[] = [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-white">{row.getValue("name")}</span>
        <span className="text-xs text-white/40">ID: {row.original.id.slice(0, 8)}</span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <span className="font-mono text-white">
          {new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
          }).format(price)}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Категория",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-[#9D4EDD]/20 px-2.5 py-0.5 text-xs font-medium text-[#9D4EDD]">
        {row.getValue("category")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={
            status === "ACTIVE"
              ? "inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400"
              : "inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60"
          }
        >
          {status === "ACTIVE" ? "Активен" : "Архив"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Edit:", row.original.id);
            }}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Delete:", row.original.id);
            }}
            className="rounded-lg p-2 text-white/60 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

// 3. Используем в компоненте
export default function PCBuildsTable() {
  // Моковые данные для примера
  const data: PCBuild[] = [
    {
      id: "cm1234567890",
      name: "Игровой ПК - Начальный уровень",
      price: 85000,
      category: "Игровые",
      status: "ACTIVE",
      createdAt: new Date("2025-01-15"),
    },
    {
      id: "cm0987654321",
      name: "Рабочая станция Pro",
      price: 150000,
      category: "Профессиональные",
      status: "ACTIVE",
      createdAt: new Date("2025-01-20"),
    },
    {
      id: "cm1122334455",
      name: "Офисный ПК Стандарт",
      price: 45000,
      category: "Офисные",
      status: "ARCHIVED",
      createdAt: new Date("2024-12-10"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сборки ПК</h1>
          <p className="text-sm text-white/60">
            Управление каталогом готовых сборок
          </p>
        </div>
        <button className="rounded-lg border border-[#9D4EDD]/20 bg-[#9D4EDD] px-4 py-2 text-sm font-medium text-white hover:bg-[#9D4EDD]/90">
          Добавить сборку
        </button>
      </div>

      {/* Основное использование с минимальными props */}
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Поиск по сборкам..."
        emptyMessage="Сборки не найдены"
        onRowClick={(row) => console.log("Row clicked:", row)}
      />

      {/* Использование с кастомными настройками */}
      {/*
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Поиск по названию..."
        searchKey="name" // Поиск только по колонке name
        emptyMessage="Нет активных сборок"
        pageSize={20}
        loading={isLoading}
        enablePagination={true}
        enableSorting={true}
        enableFiltering={true}
        onRowClick={(row) => router.push(`/admin/pcs/${row.id}`)}
      />
      */}
    </div>
  );
}

/**
 * ВАЖНЫЕ ЗАМЕЧАНИЯ:
 *
 * 1. Типизация:
 *    - Всегда определяйте тип данных (type PCBuild)
 *    - Используйте ColumnDef<YourType> для типизации колонок
 *
 * 2. Сортировка:
 *    - По умолчанию все колонки сортируются
 *    - Чтобы отключить: добавьте enableSorting: false в column def
 *
 * 3. Поиск:
 *    - Без searchKey - глобальный поиск по всем колонкам
 *    - С searchKey="name" - поиск только по указанной колонке
 *
 * 4. Кастомные ячейки:
 *    - Используйте cell: ({ row }) => для кастомного рендера
 *    - row.getValue("key") - для получения значения
 *    - row.original - для доступа ко всему объекту
 *
 * 5. Actions колонка:
 *    - Используйте id: "actions" вместо accessorKey
 *    - Добавьте e.stopPropagation() чтобы не срабатывал onRowClick
 *
 * 6. VA-PC Theme:
 *    - Фон: bg-white/5 с backdrop-blur-lg
 *    - Бордеры: border-[#9D4EDD]/20
 *    - Акцент: text-[#9D4EDD], bg-[#9D4EDD]
 *    - Текст: text-white, text-white/60
 */
