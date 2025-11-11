"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/lib/toast";
import { useSaveShortcut } from "@/hooks";
import { Loader2, ArrowLeft, Save, Plus, X } from "lucide-react";

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
import { Switch } from "@vapc/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vapc/ui/components/card";
import { Badge } from "@vapc/ui/components/badge";
import { deviceFormSchema, generateDeviceSlug, formatPrice, type DeviceFormData } from "@/lib/validations/devices";

type Device = {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  price: number;
  coverImageId: string;
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
  gallery: {
    id: string;
    key: string;
  }[];
};

type Category = {
  id: string;
  title: string;
};

interface DeviceFormProps {
  device: Device | null;
  categories: Category[];
}

export function DeviceForm({ device, categories }: DeviceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [badgeInput, setBadgeInput] = useState("");

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: device
      ? {
          slug: device.slug,
          categoryId: device.categoryId,
          title: device.title,
          price: device.price,
          coverImageId: device.coverImageId || undefined,
          badges: device.badges,
          isTop: device.isTop,
        }
      : {
          slug: "",
          categoryId: categories[0]?.id || "",
          title: "",
          price: 1000,
          coverImageId: undefined,
          badges: [],
          isTop: false,
        },
  });

  const onSubmit = async (data: DeviceFormData) => {
    setIsSubmitting(true);
    try {
      const url = device ? `/api/admin/devices/${device.id}` : "/api/admin/devices";
      const method = device ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось сохранить девайс");
      }

      const result = await response.json();

      toast.success(device ? "Девайс обновлён" : "Девайс создан");
      router.push("/admin/devices");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBadge = () => {
    const trimmed = badgeInput.trim();
    if (!trimmed) return;

    const currentBadges = form.getValues("badges");
    if (currentBadges.includes(trimmed)) {
      toast.error("Этот badge уже добавлен");
      return;
    }

    form.setValue("badges", [...currentBadges, trimmed]);
    setBadgeInput("");
  };

  const handleRemoveBadge = (badge: string) => {
    const currentBadges = form.getValues("badges");
    form.setValue(
      "badges",
      currentBadges.filter((b) => b !== badge)
    );
  };

  const price = form.watch("price");

  // Keyboard shortcut: ⌘S / Ctrl+S для сохранения
  useSaveShortcut(
    () => form.handleSubmit(onSubmit)(),
    isSubmitting,
    "Сохранение девайса... (⌘S)"
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
            {device ? "Сохранить изменения" : "Создать девайс"}
          </Button>
        </div>

        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>Название, категория и идентификатор девайса</CardDescription>
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
                      placeholder="Клавиатура HyperX Alloy FPS Pro"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        // Auto-generate slug если поле slug пустое
                        if (!form.getValues("slug")) {
                          form.setValue("slug", generateDeviceSlug(e.target.value));
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
                    <Input placeholder="klaviatura-hyperx-alloy-fps-pro" {...field} />
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Нет категорий DEVICE. Создайте категории в разделе Categories.
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Цена */}
        <Card>
          <CardHeader>
            <CardTitle>Цена</CardTitle>
            <CardDescription>Стоимость девайса в рублях</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена (₽) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5990"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Отображается как: <span className="font-semibold text-green-400">{formatPrice(price || 0)}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Медиа */}
        <Card>
          <CardHeader>
            <CardTitle>Медиа</CardTitle>
            <CardDescription>Обложка и галерея изображений</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="coverImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обложка</FormLabel>
                  <FormControl>
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Загрузка изображений будет доступна после реализации Media Library (Task 22)
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Badges & Top-4 */}
        <Card>
          <CardHeader>
            <CardTitle>Маркетинг</CardTitle>
            <CardDescription>Badges и статус Top-4</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="badges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badges</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Введите badge (например: New, Sale)"
                          value={badgeInput}
                          onChange={(e) => setBadgeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBadge();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddBadge}
                          disabled={!badgeInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((badge) => (
                            <Badge key={badge} variant="secondary" className="pl-2 pr-1">
                              {badge}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                onClick={() => handleRemoveBadge(badge)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Badges отображаются на карточке девайса. Например: "New", "Sale", "Popular"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTop"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Top-4 девайс</FormLabel>
                    <FormDescription>
                      Отображать девайс в Top-4 на главной странице
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
