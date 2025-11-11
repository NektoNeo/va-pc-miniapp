"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  Search,
  Inbox,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "@repo/ui/skeleton";
import { ModernCard, ModernCardContent } from "@repo/ui/modern-card";
import { ModernButton } from "@repo/ui/modern-button";

/**
 * DataTable Component Props
 *
 * @template TData - The type of data in the table rows
 * @template TValue - The type of values in table cells
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<PCBuild>[] = [
 *   {
 *     accessorKey: "name",
 *     header: "Name",
 *     cell: ({ row }) => <span>{row.getValue("name")}</span>,
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={pcBuilds}
 *   searchPlaceholder="Search PC builds..."
 * />
 * ```
 */
interface DataTableProps<TData, TValue> {
  /** Column definitions for the table */
  columns: ColumnDef<TData, TValue>[];
  /** Array of data to display */
  data: TData[];
  /** Callback when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Enable pagination (default: true) */
  enablePagination?: boolean;
  /** Enable sorting (default: true) */
  enableSorting?: boolean;
  /** Enable filtering/search (default: true) */
  enableFiltering?: boolean;
  /** Default page size (default: 10) */
  pageSize?: number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Search column key (default: global search) */
  searchKey?: string;
}

/**
 * Reusable DataTable component with VA-PC dark theme
 * Built on TanStack Table v8 with full TypeScript support
 *
 * Features:
 * - Pagination with customizable page sizes
 * - Column sorting (single/multi)
 * - Global and column-specific filtering
 * - Loading and empty states
 * - Responsive design
 * - VA-PC themed styling
 * - Full keyboard accessibility
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  pageSize = 10,
  loading = false,
  emptyMessage = "No results found",
  searchPlaceholder = "Search...",
  searchKey,
}: DataTableProps<TData, TValue>) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    manualPagination: false,
  });

  // Debounced search handler
  const handleSearch = React.useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (searchKey) {
          table.getColumn(searchKey)?.setFilterValue(value);
        } else {
          setGlobalFilter(value);
        }
      }, 300);
    };
  }, [searchKey, table]);

  return (
    <div className="space-y-4">
      {/* Toolbar with search */}
      {enableFiltering && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "h-10 w-full rounded-lg border border-[#9D4EDD]/20 bg-white/5 pl-9 pr-4",
                "text-sm text-white placeholder:text-white/40",
                "backdrop-blur-lg transition-all",
                "focus:border-[#9D4EDD]/40 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20"
              )}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative rounded-xl border border-[#9D4EDD]/20 bg-white/5 backdrop-blur-lg overflow-hidden">
        {/* Modern Loading State with Skeleton */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md p-4">
            <SkeletonTable columns={columns.length} rows={5} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[#9D4EDD]/30 bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 backdrop-blur-xl"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-white"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() && "cursor-pointer select-none",
                          )}
                          onClick={
                            header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {enableSorting && header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-[#9D4EDD]" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-4 w-4 text-[#9D4EDD]" />
                              ) : (
                                <div className="h-4 w-4 text-white/20">
                                  <ArrowUp className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "border-b border-[#9D4EDD]/10 transition-all duration-300 group",
                      "hover:bg-gradient-to-r hover:from-purple-500/5 hover:via-pink-500/5 hover:to-purple-500/5",
                      "hover:shadow-[0_0_20px_rgba(157,78,221,0.15)] hover:scale-[1.01]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 align-middle text-sm text-white/80"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-64 text-center p-8"
                  >
                    <ModernCard variant="glass" className="inline-flex flex-col items-center justify-center gap-4 min-w-[300px]">
                      <ModernCardContent className="flex flex-col items-center gap-3">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-purple glow-hover">
                          <Sparkles className="h-10 w-10 text-purple-400" />
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                          <p className="text-sm font-medium text-white">{emptyMessage}</p>
                          <p className="text-xs text-white/40">Начните работу, создав первый элемент</p>
                        </div>
                      </ModernCardContent>
                    </ModernCard>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            {" · "}
            {table.getFilteredRowModel().rows.length} row(s)
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className={cn(
                "h-9 rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-3 text-sm text-white",
                "backdrop-blur-lg transition-all",
                "focus:border-[#9D4EDD]/40 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20"
              )}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size} className="bg-[#1A1A1A]">
                  {size} rows
                </option>
              ))}
            </select>

            {/* Navigation buttons */}
            <div className="flex gap-1">
              <ModernButton
                variant="glass"
                size="icon-sm"
                animation="scale-bounce"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </ModernButton>
              <ModernButton
                variant="glass"
                size="icon-sm"
                animation="scale-bounce"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </ModernButton>
              <ModernButton
                variant="glass"
                size="icon-sm"
                animation="scale-bounce"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </ModernButton>
              <ModernButton
                variant="glass"
                size="icon-sm"
                animation="scale-bounce"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
