"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/lib/toast";
import { useSaveShortcut } from "@/hooks";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader2, Eye, ArrowLeft, Save } from "lucide-react";

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
import { Textarea } from "@vapc/ui/components/textarea";
import { Switch } from "@vapc/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vapc/ui/components/card";
import { Separator } from "@vapc/ui/components/separator";
import { Badge } from "@vapc/ui/components/badge";
import { promoCampaignFormSchema, generatePromoSlug } from "@/lib/validations/promo-campaigns";

type PromoCampaignFormData = z.infer<typeof promoCampaignFormSchema>;

type PromoCampaign = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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
  bannerImageId: string | null;
  bannerImage: { id: string; url: string } | null;
};

interface PromoFormProps {
  campaign: PromoCampaign | null;
}

type PreviewItem = {
  id: string;
  type: "PC" | "DEVICE";
  title: string;
  originalPrice: number;
  promoPrice: number;
  discount: number;
  savings: number;
};

type PreviewData = {
  campaign: PromoCampaign;
  items: PreviewItem[];
  stats: {
    total: number;
    pcBuilds: number;
    devices: number;
    averageDiscount: number;
    totalSavings: number;
  };
};

function formatDateTime(date: Date): string {
  // Преобразуем в формат datetime-local: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function PromoForm({ campaign }: PromoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const form = useForm<PromoCampaignFormData>({
    resolver: zodResolver(promoCampaignFormSchema),
    defaultValues: campaign
      ? {
          title: campaign.title,
          slug: campaign.slug,
          description: campaign.description || "",
          active: campaign.active,
          startsAt: campaign.startsAt,
          endsAt: campaign.endsAt,
          priority: campaign.priority,
          rules: campaign.rules,
          bannerImageId: campaign.bannerImageId || undefined,
        }
      : {
          title: "",
          slug: "",
          description: "",
          active: false,
          startsAt: new Date(),
          endsAt: null,
          priority: 0,
          rules: {
            type: "percentOff",
            value: 10,
            minPrice: null,
            maxPrice: null,
          },
          bannerImageId: undefined,
        },
  });

  const discountType = form.watch("rules.type");

  const onSubmit = async (data: PromoCampaignFormData) => {
    setIsSubmitting(true);
    try {
      const url = campaign ? `/api/admin/promos/${campaign.id}` : "/api/admin/promos";
      const method = campaign ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось сохранить промо-кампанию");
      }

      const result = await response.json();

      toast.success(campaign ? "Промо-кампания обновлена" : "Промо-кампания создана");
      router.push("/admin/promos");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadPreview = async () => {
    if (!campaign) {
      toast.error("Preview доступен только для сохранённых промо-кампаний");
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await fetch(`/api/admin/promos/${campaign.id}/preview`);

      if (!response.ok) {
        throw new Error("Не удалось загрузить предпросмотр");
      }

      const result = await response.json();
      setPreviewData(result.data);
      toast.success("Предпросмотр загружен");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при загрузке preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Keyboard shortcut: ⌘S / Ctrl+S для сохранения
  useSaveShortcut(
    () => form.handleSubmit(onSubmit)(),
    isSubmitting,
    "Сохранение промо-кампании... (⌘S)"
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
          <div className="flex items-center gap-2">
            {campaign && (
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadPreview}
                disabled={isLoadingPreview}
              >
                {isLoadingPreview ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Показать затронутые товары
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {campaign ? "Сохранить изменения" : "Создать промо-кампанию"}
            </Button>
          </div>
        </div>

        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>Название, описание и статус промо-кампании</CardDescription>
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
                      placeholder="Новогодняя распродажа"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        // Auto-generate slug если поле slug пустое
                        if (!form.getValues("slug")) {
                          form.setValue("slug", generatePromoSlug(e.target.value));
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
                    <Input placeholder="novogodnyaya-rasprodazha" {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Краткое описание промо-кампании для внутреннего использования"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Активна</FormLabel>
                    <FormDescription>
                      Включить или отключить промо-кампанию
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

        {/* Даты */}
        <Card>
          <CardHeader>
            <CardTitle>Даты проведения</CardTitle>
            <CardDescription>Укажите период действия промо-кампании</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата начала *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value ? formatDateTime(new Date(field.value)) : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : new Date();
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата окончания</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value ? formatDateTime(new Date(field.value)) : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Оставьте пустым для бессрочной акции</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Правила скидки */}
        <Card>
          <CardHeader>
            <CardTitle>Правила скидки</CardTitle>
            <CardDescription>Настройте тип и размер скидки</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="rules.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип скидки *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип скидки" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentOff">Процент от цены (-X%)</SelectItem>
                      <SelectItem value="fixedOff">Фиксированная скидка (-X₽)</SelectItem>
                      <SelectItem value="fixedPrice">Фиксированная цена (=X₽)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rules.value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {discountType === "percentOff" && "Процент скидки *"}
                    {discountType === "fixedOff" && "Размер скидки (₽) *"}
                    {discountType === "fixedPrice" && "Цена товара (₽) *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={discountType === "percentOff" ? "10" : "1000"}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {discountType === "percentOff" && "От 1 до 99"}
                    {discountType === "fixedOff" && "Сумма будет вычтена из исходной цены"}
                    {discountType === "fixedPrice" && "Товары будут стоить эту цену"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div className="text-sm font-medium">Фильтры по цене (опционально)</div>

              <FormField
                control={form.control}
                name="rules.minPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Минимальная цена товара</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Акция применится только к товарам дороже этой суммы
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rules.maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Максимальная цена товара</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="999999"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Акция применится только к товарам дешевле этой суммы
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные настройки */}
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Приоритет</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    От 0 до 999. Чем выше приоритет, тем раньше отображается акция
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Баннер акции</FormLabel>
                  <FormControl>
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Загрузка изображений будет доступна после реализации Media Library (Task
                        22)
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preview затронутых товаров */}
        {previewData && (
          <Card>
            <CardHeader>
              <CardTitle>Затронутые товары</CardTitle>
              <CardDescription>
                Товары, которые попадают под условия этой промо-кампании
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Статистика */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">{previewData.stats.total}</div>
                  <div className="text-xs text-muted-foreground">Всего товаров</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">{previewData.stats.pcBuilds}</div>
                  <div className="text-xs text-muted-foreground">Сборок ПК</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">{previewData.stats.devices}</div>
                  <div className="text-xs text-muted-foreground">Устройств</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">{previewData.stats.averageDiscount}%</div>
                  <div className="text-xs text-muted-foreground">Средняя скидка</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">
                    {previewData.stats.totalSavings.toLocaleString()}₽
                  </div>
                  <div className="text-xs text-muted-foreground">Общая экономия</div>
                </div>
              </div>

              <Separator />

              {/* Список товаров */}
              <div className="space-y-2">
                {previewData.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет товаров, подходящих под условия акции
                  </div>
                ) : (
                  previewData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.type === "PC" ? "Сборка" : "Устройство"}</Badge>
                          <Badge className="bg-red-600">-{item.discount}%</Badge>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm line-through text-muted-foreground">
                          {item.originalPrice.toLocaleString()}₽
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          {item.promoPrice.toLocaleString()}₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Экономия: {item.savings.toLocaleString()}₽
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
