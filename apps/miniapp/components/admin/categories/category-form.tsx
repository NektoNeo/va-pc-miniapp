"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { useSaveShortcut } from "@/hooks";
import { Loader2, ArrowLeft, Save, AlertTriangle } from "lucide-react";

import { Button } from "@vapc/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapc/ui/components/form";
import { Input } from "@vapc/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vapc/ui/components/card";
import { Badge } from "@vapc/ui/components/badge";
import { categoryFormSchema, generateCategorySlug, type CategoryFormData } from "@/lib/validations/categories";

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
};

type SimplifiedCategory = {
  id: string;
  slug: string;
  kind: "PC" | "DEVICE";
  title: string;
  parentId: string | null;
};

interface CategoryFormProps {
  category: Category | null;
  allCategories: SimplifiedCategory[];
}

export function CategoryForm({ category, allCategories }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          slug: category.slug,
          kind: category.kind,
          title: category.title,
          parentId: category.parentId || null,
        }
      : {
          slug: "",
          kind: "DEVICE",
          title: "",
          parentId: null,
        },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось сохранить категорию");
      }

      toast.success(category ? "Категория обновлена" : "Категория создана");
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedKind = form.watch("kind");

  // Фильтрация категорий для parentId Select
  const availableParents = allCategories.filter((cat) => {
    // Только категории того же kind
    if (cat.kind !== selectedKind) return false;

    // Исключить саму категорию (в edit mode)
    if (category && cat.id === category.id) return false;

    // Исключить дочерние категории текущей (в edit mode)
    if (category && category.children.some((child) => child.id === cat.id)) return false;

    return true;
  });

  // Keyboard shortcut: ⌘S / Ctrl+S для сохранения
  useSaveShortcut(
    () => form.handleSubmit(onSubmit)(),
    isSubmitting,
    "Сохранение категории... (⌘S)"
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {category ? "Сохранить изменения" : "Создать категорию"}
          </Button>
        </div>

        {/* Warning: Edit mode restrictions */}
        {category && (category.children.length > 0 || category.parent) && (
          <Card className="border-yellow-600/20 bg-yellow-600/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Ограничения при редактировании
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {category.children.length > 0 && (
                <p>
                  • Нельзя изменить тип (kind) категории, так как у неё есть{" "}
                  <Badge variant="secondary">{category.children.length}</Badge> подкатегорий
                </p>
              )}
              {category.parent && (
                <p>
                  • Категория является подкатегорией для{" "}
                  <Badge variant="secondary">{category.parent.title}</Badge>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>Название, тип и идентификатор категории</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Игровые ПК"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        // Auto-generate slug если поле slug пустое
                        if (!form.getValues("slug")) {
                          form.setValue("slug", generateCategorySlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL) *</FormLabel>
                  <FormControl>
                    <Input placeholder="igrovye-pk" {...field} />
                  </FormControl>
                  <FormDescription>
                    Только латинские буквы, цифры и дефисы. Используется в URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип категории *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      category !== null &&
                      (category.children.length > 0 ||
                        allCategories.some((c) => c.parentId === category.id))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PC">PC Builds</SelectItem>
                      <SelectItem value="DEVICE">Devices</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedKind === "PC"
                      ? "Категория для компьютерных сборок"
                      : "Категория для периферии и аксессуаров"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Иерархия */}
        <Card>
          <CardHeader>
            <CardTitle>Иерархия</CardTitle>
            <CardDescription>Установите родительскую категорию (опционально)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Родительская категория</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Нет (корневая категория)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Нет (корневая категория)</SelectItem>
                      {availableParents.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Нет доступных категорий типа {selectedKind}
                        </div>
                      ) : (
                        availableParents.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Подкатегории помогают организовать иерархию. Можно оставить пустым для корневой
                    категории.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {category && category.children.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Дочерние категории:</p>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <Badge key={child.id} variant="secondary">
                      {child.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
