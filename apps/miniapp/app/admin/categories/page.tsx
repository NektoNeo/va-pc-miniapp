import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@vapc/ui/components/button";
import { db } from "@/lib/db";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { PlusCircle } from "lucide-react";

export const metadata = {
  title: "Категории | Admin Panel",
  description: "Управление категориями PC Builds и Devices",
};

async function getCategories() {
  const categories = await db.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          pcBuilds: true,
          devices: true,
        },
      },
    },
    orderBy: [
      { kind: "asc" }, // Сначала DEVICE, потом PC
      { title: "asc" },
    ],
  });

  return categories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Категории</h1>
          <p className="text-muted-foreground mt-2">
            Управление категориями для PC Builds и Devices
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Создать категорию
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Загрузка категорий...</p>
          </div>
        }
      >
        <CategoriesTable categories={categories} />
      </Suspense>
    </div>
  );
}
