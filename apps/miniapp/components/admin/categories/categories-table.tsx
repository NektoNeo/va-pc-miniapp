"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Folder } from "lucide-react";
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

type Category = {
  id: string;
  slug: string;
  kind: "PC" | "DEVICE";
  title: string;
  parentId: string | null;
  parent: {
    id: string;
    title: string;
  } | null;
  children: {
    id: string;
    title: string;
  }[];
  _count: {
    pcBuilds: number;
    devices: number;
  };
};

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не удалось удалить категорию");
      }

      toast.success("Категория удалена");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">/{row.original.slug}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {row.original.parent && (
              <Badge variant="outline" className="text-xs">
                <Folder className="h-3 w-3 mr-1" />
                Родитель: {row.original.parent.title}
              </Badge>
            )}
            {row.original.children.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {row.original.children.length} подкатегор{row.original.children.length === 1 ? "ия" : "ий"}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "kind",
      header: "Тип",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.kind === "PC"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
          }
        >
          {row.original.kind === "PC" ? "PC Builds" : "Devices"}
        </Badge>
      ),
    },
    {
      id: "usage",
      header: "Использование",
      cell: ({ row }) => {
        const pcCount = row.original._count.pcBuilds;
        const deviceCount = row.original._count.devices;
        const total = pcCount + deviceCount;

        if (total === 0) {
          return <span className="text-xs text-muted-foreground">Не используется</span>;
        }

        return (
          <div className="flex items-center gap-2 flex-wrap">
            {pcCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pcCount} PC
              </Badge>
            )}
            {deviceCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {deviceCount} Device
              </Badge>
            )}
          </div>
        );
      },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/categories/${row.original.id}`)}>
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
      <DataTable columns={columns} data={categories} searchKey="title" />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Категория будет удалена навсегда.
              <br />
              <br />
              <span className="text-yellow-600">
                Нельзя удалить категорию с подкатегориями или используемую в PC Builds/Devices.
              </span>
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
