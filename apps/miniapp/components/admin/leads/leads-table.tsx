"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vapc/ui/components/table";
import { Input } from "@vapc/ui/components/input";
import { Button } from "@vapc/ui/components/button";
import { Label } from "@vapc/ui/components/label";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  DollarSign,
  Package,
  User,
} from "lucide-react";
import { toast } from "@/lib/toast";

type LeadItem = {
  pcId?: string;
  deviceId?: string;
  options?: Record<string, any>;
  price: number;
  title?: string;
};

type Lead = {
  id: string;
  tgUserId: string;
  items: LeadItem[];
  phone: string | null;
  comment: string | null;
  createdAt: string;
};

type LeadsResponse = {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalLeads: number;
    totalItems: number;
    totalRevenue: number;
  };
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ru,
  });
};

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalItems: 0,
    totalRevenue: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // Fetch leads
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (dateFrom) {
        params.append("from", dateFrom);
      }

      if (dateTo) {
        params.append("to", dateTo);
      }

      const response = await fetch(`/api/admin/leads?${params}`);

      if (!response.ok) {
        throw new Error("Ошибка загрузки лидов");
      }

      const result: LeadsResponse = await response.json();

      setLeads(result.data);
      setPagination({
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      });
      setStats(result.stats);
    } catch (error) {
      toast.error("Не удалось загрузить лиды");
      console.error("Leads fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, debouncedSearch, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  // Table columns
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Дата создания",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              {formatDate(row.original.createdAt)}
            </p>
            <p className="text-xs text-white/50">
              {formatRelativeTime(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "tgUserId",
        header: "Telegram User ID",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/40" />
            <code className="rounded bg-white/5 px-2 py-1 text-xs text-[#9D4EDD]">
              {row.original.tgUserId}
            </code>
          </div>
        ),
      },
      {
        accessorKey: "items",
        header: "Товары",
        cell: ({ row }) => {
          const items = row.original.items || [];
          const totalPrice = items.reduce(
            (sum, item) => sum + (item.price || 0),
            0
          );

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-white/40" />
                <p className="text-sm text-white">
                  {items.length} {items.length === 1 ? "товар" : "товаров"}
                </p>
              </div>
              <p className="text-xs font-medium text-[#9D4EDD]">
                {formatPrice(totalPrice)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Телефон",
        cell: ({ row }) => (
          <div>
            {row.original.phone ? (
              <a
                href={`tel:${row.original.phone}`}
                className="text-sm text-white hover:text-[#9D4EDD] transition-colors"
              >
                {row.original.phone}
              </a>
            ) : (
              <span className="text-sm text-white/30">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "comment",
        header: "Комментарий",
        cell: ({ row }) => (
          <div className="max-w-xs">
            {row.original.comment ? (
              <p
                className="truncate text-sm text-white/70"
                title={row.original.comment}
              >
                {row.original.comment}
              </p>
            ) : (
              <span className="text-sm text-white/30">—</span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  const handleClearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[#1A1A1A]/60 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Всего лидов</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.totalLeads}
              </p>
            </div>
            <div className="rounded-lg bg-[#9D4EDD]/10 p-3">
              <User className="h-6 w-6 text-[#9D4EDD]" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#1A1A1A]/60 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Товаров в заказах</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stats.totalItems}
              </p>
            </div>
            <div className="rounded-lg bg-[#9D4EDD]/10 p-3">
              <Package className="h-6 w-6 text-[#9D4EDD]" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#1A1A1A]/60 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Общий доход</p>
              <p className="mt-1 text-2xl font-bold text-[#9D4EDD]">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-lg bg-[#9D4EDD]/10 p-3">
              <DollarSign className="h-6 w-6 text-[#9D4EDD]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-[#1A1A1A]/60 border border-white/10 p-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search" className="text-white/80">
              Поиск
            </Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Телефон, комментарий, Telegram ID..."
                className="pl-9 bg-[#1A1A1A]/60 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <Label htmlFor="date-from" className="text-white/80">
              От даты
            </Label>
            <div className="relative mt-1.5">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 pointer-events-none" />
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-9 bg-[#1A1A1A]/60 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <Label htmlFor="date-to" className="text-white/80">
              До даты
            </Label>
            <div className="relative mt-1.5">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 pointer-events-none" />
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-9 bg-[#1A1A1A]/60 border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-white/60 hover:text-white"
            >
              Очистить фильтры
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#1A1A1A]/60 border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-white/60">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#9D4EDD] border-t-transparent" />
              <p className="text-sm">Загрузка лидов...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-white/20 mb-3" />
            <p className="text-white/60">
              {hasFilters ? "Лиды не найдены" : "Лидов пока нет"}
            </p>
            <p className="text-sm text-white/40 mt-1">
              {hasFilters
                ? "Попробуйте изменить фильтры"
                : "Здесь будут отображаться входящие заявки"}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-white/10">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-white/80 font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-white/10 hover:bg-white/5 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <p className="text-sm text-white/60">
                Показано {(page - 1) * limit + 1}–
                {Math.min(page * limit, pagination.total)} из{" "}
                {pagination.total} лидов
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="text-white border-white/10 hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Назад
                </Button>

                <span className="text-sm text-white/60">
                  Страница {page} из {pagination.totalPages || 1}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages || isLoading}
                  className="text-white border-white/10 hover:bg-white/5"
                >
                  Вперёд
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
