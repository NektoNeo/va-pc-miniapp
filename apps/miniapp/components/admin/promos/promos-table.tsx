"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@vapc/ui/components/button";
import { Badge } from "@vapc/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vapc/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vapc/ui/components/alert-dialog";

type PromoCampaign = {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  startsAt: Date;
  endsAt: Date | null;
  priority: number;
  rules: {
    type: "percentOff" | "fixedOff" | "fixedPrice";
    value: number;
    minPrice?: number | null;
    maxPrice?: number | null;
  };
  bannerImage: { id: string; url: string } | null;
};

interface PromosCampaignsTableProps {
  campaigns: PromoCampaign[];
}

function getTimeStatusBadge(startsAt: Date, endsAt: Date | null) {
  const now = new Date();

  if (now < startsAt) {
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
        Будущая
      </Badge>
    );
  }

  if (endsAt && now > endsAt) {
    return (
      <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
        Истёкшая
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
      Текущая
    </Badge>
  );
}

function getDiscountTypeBadge(type: "percentOff" | "fixedOff" | "fixedPrice", value: number) {
  switch (type) {
    case "percentOff":
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
          -{value}%
        </Badge>
      );
    case "fixedOff":
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
          -{value}₽
        </Badge>
      );
    case "fixedPrice":
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
          Цена {value}₽
        </Badge>
      );
  }
}

export function PromosCampaignsTable({ campaigns }: PromosCampaignsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/promos/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не удалось удалить промо-кампанию");
      }

      toast.success("Промо-кампания удалена");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<PromoCampaign>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">/{row.original.slug}</div>
          <div className="flex items-center gap-2 mt-1">
            {row.original.active ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                Активна
              </Badge>
            ) : (
              <Badge variant="secondary">Неактивна</Badge>
            )}
            {getTimeStatusBadge(row.original.startsAt, row.original.endsAt)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startsAt",
      header: "Даты",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">
            {format(new Date(row.original.startsAt), "dd MMM yyyy, HH:mm", { locale: ru })}
          </div>
          {row.original.endsAt ? (
            <div className="text-sm text-muted-foreground">
              {format(new Date(row.original.endsAt), "dd MMM yyyy, HH:mm", { locale: ru })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Бессрочно</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "rules",
      header: "Скидка",
      cell: ({ row }) => {
        const { type, value, minPrice, maxPrice } = row.original.rules;
        return (
          <div className="space-y-1">
            {getDiscountTypeBadge(type, value)}
            {(minPrice || maxPrice) && (
              <div className="text-xs text-muted-foreground">
                {minPrice && maxPrice
                  ? `${minPrice.toLocaleString()}₽ - ${maxPrice.toLocaleString()}₽`
                  : minPrice
                  ? `от ${minPrice.toLocaleString()}₽`
                  : `до ${maxPrice!.toLocaleString()}₽`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Приоритет",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.priority}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/admin/promos/${row.original.id}`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(row.original.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={campaigns} searchKey="title" />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить промо-кампанию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Промо-кампания будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
