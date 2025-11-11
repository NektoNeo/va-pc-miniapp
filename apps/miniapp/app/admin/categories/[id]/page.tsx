import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/categories/category-form";

interface CategoryFormPageProps {
  params: Promise<{ id: string }>;
}

async function getCategory(id: string) {
  if (id === "new") {
    return null;
  }

  const category = await db.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
    },
  });

  if (!category) {
    notFound();
  }

  return category;
}

async function getAllCategories() {
  const categories = await db.category.findMany({
    orderBy: [
      { kind: "asc" },
      { title: "asc" },
    ],
  });

  return categories;
}

export async function generateMetadata({ params }: CategoryFormPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  return {
    title: category ? `Редактирование: ${category.title}` : "Новая категория",
    description: category
      ? `Редактирование категории ${category.title}`
      : "Создание новой категории",
  };
}

export default async function CategoryFormPage({ params }: CategoryFormPageProps) {
  const { id } = await params;
  const category = await getCategory(id);
  const allCategories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {category ? `Редактирование: ${category.title}` : "Новая категория"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {category
            ? "Измените параметры категории и сохраните изменения"
            : "Заполните форму для создания новой категории"}
        </p>
      </div>

      <CategoryForm category={category} allCategories={allCategories} />
    </div>
  );
}
