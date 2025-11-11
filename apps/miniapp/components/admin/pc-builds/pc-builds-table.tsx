"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Edit, Trash2, MoreVertical, Eye, Star } from "lucide-react";
import { formatPrice } from "@/lib/validations/pc-builds";
import { toast } from "sonner";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ModernBadge } from "@repo/ui/modern-badge";
import { ModernButton } from "@repo/ui/modern-button";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from "@repo/ui/modern-card";

/**
 * PC Build List Item Type
 * Точная копия типа из page.tsx для типизации таблицы
 */
type PCBuildListItem = Prisma.PcBuildGetPayload<{
  include: {
    coverImage: {
      select: {
        id: true;
        key: true;
        blurhash: true;
        avgColor: true;
      };
    };
    _count: {
      select: {
        gallery: true;
        fpsMetrics: true;
      };
    };
  };
}>;

interface PCBuildsTableProps {
  data: PCBuildListItem[];
}

/**
 * Availability Badge Component - Modernized
 */
function AvailabilityBadge({ status }: { status: string }) {
  const config = {
    IN_STOCK: {
      label: "В наличии",
      variant: "gradient-success" as const,
    },
    PREORDER: {
      label: "Предзаказ",
      variant: "gradient-warning" as const,
    },
    OUT_OF_STOCK: {
      label: "Нет в наличии",
      variant: "glass" as const,
    },
  };

  const style = config[status as keyof typeof config] || config.OUT_OF_STOCK;

  return (
    <ModernBadge variant={style.variant} size="sm">
      {style.label}
    </ModernBadge>
  );
}

/**
 * Resolution Targets Badges - Modernized
 */
function TargetsBadges({ targets }: { targets: string[] }) {
  const variants = {
    FHD: "gradient-info" as const,
    QHD: "gradient" as const,
    UHD4K: "gradient-warning" as const,
  };

  return (
    <div className="flex flex-wrap gap-1">
      {targets.map((target) => (
        <ModernBadge
          key={target}
          variant={variants[target as keyof typeof variants] || "glass"}
          size="sm"
        >
          {target}
        </ModernBadge>
      ))}
    </div>
  );
}

/**
 * Delete Confirmation Dialog Component - Modernized
 */
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  buildTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  buildTitle: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <ModernCard variant="glass-strong" className="w-full max-w-md">
        <ModernCardHeader>
          <ModernCardTitle withGlow>Удалить сборку?</ModernCardTitle>
        </ModernCardHeader>

        <ModernCardContent>
          <p className="text-sm text-muted-foreground">
            Вы уверены, что хотите удалить сборку{" "}
            <span className="font-medium text-white">"{buildTitle}"</span>?
            <br />
            Это действие нельзя будет отменить.
          </p>
        </ModernCardContent>

        <ModernCardFooter withDivider>
          <ModernButton
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Отмена
          </ModernButton>
          <ModernButton
            variant="destructive"
            size="md"
            onClick={onConfirm}
            className="flex-1"
          >
            Удалить
          </ModernButton>
        </ModernCardFooter>
      </ModernCard>
    </div>
  );
}

/**
 * PC Builds Table Client Component
 */
export function PCBuildsTable({ data }: PCBuildsTableProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    buildId: string | null;
    buildTitle: string;
  }>({
    isOpen: false,
    buildId: null,
    buildTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Обработчик удаления сборки
   */
  const handleDelete = async () => {
    if (!deleteDialog.buildId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/pcs/${deleteDialog.buildId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка при удалении сборки");
        return;
      }

      toast.success("Сборка успешно удалена");
      setDeleteDialog({ isOpen: false, buildId: null, buildTitle: "" });
      router.refresh();
    } catch (error) {
      console.error("[PC Builds Table] Delete error:", error);
      toast.error("Произошла ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Определение колонок таблицы
   */
  const columns: ColumnDef<PCBuildListItem>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="flex items-start gap-3">
          {/* Cover Image Preview */}
          {row.original.coverImage && (
            <div
              className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#9D4EDD]/20 bg-white/5"
              style={{
                backgroundColor: row.original.coverImage.avgColor || "#9D4EDD20",
              }}
            >
              {/* TODO: Replace with actual image when Media Library is ready */}
            </div>
          )}

          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.title}</span>
            {row.original.subtitle && (
              <span className="text-xs text-white/40">
                {row.original.subtitle}
              </span>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
              <span>ID: {row.original.id.slice(0, 8)}</span>
              {row.original.isTop && (
                <span className="inline-flex items-center gap-1 text-yellow-400">
                  <Star className="h-3 w-3 fill-current" />
                  TOP
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "priceBase",
      header: "Цена",
      cell: ({ row }) => (
        <span className="font-mono text-white">
          {formatPrice(row.original.priceBase)}
        </span>
      ),
    },
    {
      accessorKey: "targets",
      header: "Разрешения",
      cell: ({ row }) => <TargetsBadges targets={row.original.targets} />,
    },
    {
      accessorKey: "availability",
      header: "Статус",
      cell: ({ row }) => (
        <AvailabilityBadge status={row.original.availability} />
      ),
    },
    {
      id: "stats",
      header: "Статистика",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-xs text-white/60">
          <span>Галерея: {row.original._count.gallery}</span>
          <span>FPS метрики: {row.original._count.fpsMetrics}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Создано",
      cell: ({ row }) => (
        <span className="text-xs text-white/60">
          {format(new Date(row.original.createdAt), "dd MMM yyyy", {
            locale: ru,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {/* Preview Button - Modern with Glass Effect */}
          <ModernButton
            variant="ghost"
            size="icon-sm"
            animation="scale-bounce"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement preview in mini app (Task 25)
              toast.info("Preview функционал будет реализован в Task 25");
            }}
            title="Предпросмотр в Mini App"
          >
            <Eye className="h-4 w-4" />
          </ModernButton>

          {/* Edit Button - Modern with Gradient Hover */}
          <ModernButton
            variant="ghost"
            size="icon-sm"
            animation="scale-bounce"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/pcs/${row.original.id}`);
            }}
            title="Редактировать"
          >
            <Edit className="h-4 w-4" />
          </ModernButton>

          {/* Delete Button - Modern with Red Hover Glow */}
          <ModernButton
            variant="ghost"
            size="icon-sm"
            animation="scale-bounce"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialog({
                isOpen: true,
                buildId: row.original.id,
                buildTitle: row.original.title,
              });
            }}
            className="hover:bg-red-500/20 hover:text-red-400 hover:shadow-red-500/50"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </ModernButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Поиск по названию сборки..."
        searchKey="title"
        emptyMessage="Сборки не найдены. Создайте первую сборку!"
        onRowClick={(row) => router.push(`/admin/pcs/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, buildId: null, buildTitle: "" })
        }
        onConfirm={handleDelete}
        buildTitle={deleteDialog.buildTitle}
      />
    </>
  );
}
