import { Metadata } from "next";
import { LeadsTable } from "@/components/admin/leads/leads-table";

export const metadata: Metadata = {
  title: "Лиды | Admin Panel",
  description: "Просмотр входящих лидов из Telegram Mini App",
};

/**
 * Leads List Page (Read-Only)
 *
 * Отображает таблицу с входящими лидами:
 * - Фильтрация по дате, tgUserId, phone, comment
 * - Поиск по всем полям
 * - Сортировка по дате создания
 * - Пагинация
 * - Статистика (кол-во, общий доход)
 */
export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Лиды</h1>
        <p className="mt-1 text-sm text-white/60">
          Входящие заявки из Telegram Mini App (только просмотр)
        </p>
      </div>

      {/* Table */}
      <LeadsTable />
    </div>
  );
}
