"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
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
import { formatPrice } from "@/lib/validations/devices";

type Device = {
  id: string;
  slug: string;
  title: string;
  price: number;
  badges: string[];
  isTop: boolean;
  category: {
    id: string;
    title: string;
  };
  coverImage: {
    id: string;
    key: string;
  } | null;
};

interface DevicesTableProps {
  devices: Device[];
}

export function DevicesTable({ devices }: DevicesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/devices/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не удалось удалить девайс");
      }

      toast.success("Девайс удалён");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Device>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">/{row.original.slug}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {row.original.isTop && (
              <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                <Star className="h-3 w-3 mr-1" />
                Top-4
              </Badge>
            )}
            {row.original.badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Категория",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
          {row.original.category.title}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Цена",
      cell: ({ row }) => (
        <div className="font-mono font-semibold text-green-400">
          {formatPrice(row.original.price)}
        </div>
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
            <DropdownMenuItem onClick={() => router.push(`/admin/devices/${row.original.id}`)}>
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
      <DataTable columns={columns} data={devices} searchKey="title" />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить девайс?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Девайс будет удалён навсегда.
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
