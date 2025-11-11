"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { useSaveShortcut } from "@/hooks";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import type { Prisma } from "@prisma/client";

import {
  createPCBuildSchema,
  updatePCBuildSchema,
  generateSlug,
  type CreatePCBuildInput,
  type UpdatePCBuildInput,
  type PCSpec,
  type PCOptions,
} from "@/lib/validations/pc-builds";

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
import { FloatingInput } from "@vapc/ui/components/floating-input";
import { FloatingTextarea } from "@vapc/ui/components/floating-textarea";
import { Button } from "@vapc/ui/components/button";
import { Switch } from "@vapc/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vapc/ui/components/tabs";
import { Separator } from "@vapc/ui/components/separator";
import { PreviewButton } from "@/components/admin/preview-button";

type PCBuildWithRelations = Prisma.PcBuildGetPayload<{
  include: {
    coverImage: true;
    gallery: true;
    video: true;
  };
}>;

interface PCBuildFormProps {
  initialData: PCBuildWithRelations | null;
  isEdit: boolean;
}

/**
 * Временные моки для Media Assets
 * TODO: Заменить на реальный fetch в Task 22 (Media Library)
 */
const MOCK_IMAGES = [
  { id: "mock-img-1", key: "/placeholder-pc1.jpg", alt: "Placeholder 1" },
  { id: "mock-img-2", key: "/placeholder-pc2.jpg", alt: "Placeholder 2" },
  { id: "mock-img-3", key: "/placeholder-pc3.jpg", alt: "Placeholder 3" },
];

const MOCK_VIDEOS = [
  { id: "mock-vid-1", key: "/video-placeholder.mp4" },
  { id: "mock-vid-2", key: "/video-placeholder2.mp4" },
];

export function PCBuildForm({ initialData, isEdit }: PCBuildFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Инициализация формы
  const form = useForm<CreatePCBuildInput | UpdatePCBuildInput>({
    resolver: zodResolver(isEdit ? updatePCBuildSchema : createPCBuildSchema),
    defaultValues: isEdit && initialData
      ? {
          slug: initialData.slug,
          title: initialData.title,
          subtitle: initialData.subtitle || "",
          coverImageId: initialData.coverImageId,
          videoId: initialData.videoId || undefined,
          gallery: initialData.gallery?.map((img) => img.id) || [],
          priceBase: initialData.priceBase,
          targets: initialData.targets,
          spec: initialData.spec as PCSpec,
          options: initialData.options as PCOptions,
          isTop: initialData.isTop,
          badges: initialData.badges,
          availability: initialData.availability,
        }
      : {
          slug: "",
          title: "",
          subtitle: "",
          coverImageId: "mock-img-1", // Используем фиксированный ID из seed данных
          videoId: undefined,
          gallery: [],
          priceBase: 85000,
          targets: ["FHD"],
          spec: {
            cpu: "",
            gpu: "",
            ram: "",
            ssd: "",
          },
          options: {
            ram: [{ label: "16GB DDR4", sizeGb: 16, delta: 0 }],
            ssd: [{ label: "512GB NVMe", sizeGb: 512, delta: 0 }],
          },
          isTop: false,
          badges: [],
          availability: "IN_STOCK",
        },
    mode: "onBlur",
  });

  // useFieldArray для динамических опций
  const {
    fields: ramFields,
    append: appendRam,
    remove: removeRam,
  } = useFieldArray({
    control: form.control,
    name: "options.ram",
  });

  const {
    fields: ssdFields,
    append: appendSsd,
    remove: removeSsd,
  } = useFieldArray({
    control: form.control,
    name: "options.ssd",
  });

  const {
    fields: gpuFields,
    append: appendGpu,
    remove: removeGpu,
  } = useFieldArray({
    control: form.control,
    name: "options.gpu",
  });

  const {
    fields: coolingFields,
    append: appendCooling,
    remove: removeCooling,
  } = useFieldArray({
    control: form.control,
    name: "options.cooling",
  });

  // Auto-slug generation при изменении title
  const watchTitle = form.watch("title");

  useEffect(() => {
    if (!isEdit && watchTitle) {
      form.setValue("slug", generateSlug(watchTitle), {
        shouldValidate: true,
      });
    }
  }, [watchTitle, isEdit, form]);

  // Submit handler
  const onSubmit = async (data: CreatePCBuildInput | UpdatePCBuildInput) => {
    try {
      // DIAGNOSTIC LOGGING
      console.log("[PC Build Form] onSubmit CALLED");
      console.log("[PC Build Form] form.formState.isValid:", form.formState.isValid);
      console.log("[PC Build Form] form.formState.errors:", JSON.stringify(form.formState.errors, null, 2));
      console.log("[PC Build Form] form.getValues():", JSON.stringify(form.getValues(), null, 2));
      console.log("[PC Build Form] data parameter:", JSON.stringify(data, null, 2));

      setIsSubmitting(true);

      const endpoint = isEdit
        ? `/api/admin/pcs/${initialData?.id}`
        : "/api/admin/pcs";

      const method = isEdit ? "PATCH" : "POST";

      console.log("[PC Build Form] Sending request to:", endpoint, "method:", method);

      // Удаляем только top-level undefined значения, сохраняя структуру объектов
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => {
          // Сохраняем объекты и массивы даже если они пустые
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return true;
          }
          // Удаляем только undefined
          return value !== undefined;
        })
      ) as typeof data;

      console.log("[PC Build Form] Cleaned data:", JSON.stringify(cleanedData, null, 2));

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      console.log("[PC Build Form] Response status:", response.status, "ok:", response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error("[PC Build Form] API Error:", error);
        toast.error(error.error || "Ошибка при сохранении сборки");
        return;
      }

      const result = await response.json();

      toast.success(
        isEdit ? "Сборка успешно обновлена" : "Сборка успешно создана"
      );

      // Redirect to list
      router.push("/admin/pcs");
      router.refresh();
    } catch (error) {
      console.error("[PC Build Form] Submit error:", error);
      toast.error("Произошла ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/pcs");
  };

  // Keyboard shortcut: ⌘S / Ctrl+S для сохранения
  useSaveShortcut(
    () => {
      console.log("[PC Build Form] Save shortcut triggered");
      console.log("[PC Build Form] Form state before submit:", {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        values: form.getValues(),
      });
      form.handleSubmit(onSubmit, (errors) => {
        console.error("[PC Build Form] Validation errors:", errors);
        toast.error("Проверьте форму на ошибки");
      })();
    },
    isSubmitting,
    "Сохранение сборки... (⌘S)"
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("[PC Build Form] Form submit validation failed:", JSON.stringify(errors, null, 2));
          // Показываем конкретные ошибки валидации
          const errorMessages: string[] = [];
          const flattenErrors = (errs: any, prefix = ""): void => {
            Object.entries(errs).forEach(([key, value]) => {
              const fieldPath = prefix ? `${prefix}.${key}` : key;
              if (value && typeof value === "object") {
                if ("message" in value) {
                  errorMessages.push(`${fieldPath}: ${value.message}`);
                } else {
                  flattenErrors(value, fieldPath);
                }
              }
            });
          };
          flattenErrors(errors);
          const errorText = errorMessages.length > 0 
            ? `Ошибки валидации: ${errorMessages.join(", ")}`
            : "Проверьте форму на ошибки";
          toast.error(errorText);
        })}
        className="space-y-6"
      >
        {/* Action Buttons */}
        <div className="flex items-center justify-between rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-4 backdrop-blur-lg">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Отмена
          </Button>

          <div className="flex items-center gap-3">
            {/* Preview Button - только для существующих сборок */}
            <PreviewButton
              entityType="pc"
              entityId={isEdit && initialData ? initialData.id : null}
              variant="outline"
              className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="border-[#9D4EDD]/20 bg-[#9D4EDD] text-white hover:bg-[#9D4EDD]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Обновить" : "Создать"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 p-1">
            <TabsTrigger
              value="main"
              className="data-[state=active]:bg-[#9D4EDD] data-[state=active]:text-white"
            >
              Основное
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-[#9D4EDD] data-[state=active]:text-white"
            >
              Медиа
            </TabsTrigger>
            <TabsTrigger
              value="spec"
              className="data-[state=active]:bg-[#9D4EDD] data-[state=active]:text-white"
            >
              Характеристики
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className="data-[state=active]:bg-[#9D4EDD] data-[state=active]:text-white"
            >
              Опции
            </TabsTrigger>
          </TabsList>

          {/* Tab: Основное */}
          <TabsContent
            value="main"
            className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg"
          >
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Основная информация
              </h3>

              <Separator className="bg-[#9D4EDD]/20" />

              {/* Title - Modern Floating Label */}
              <FormField
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Название сборки *"
                        placeholder="Игровой ПК - Начальный уровень"
                        error={fieldState.error?.message}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
                      Краткое описательное название (5-100 символов)
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Slug - Modern Floating Label */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="URL-slug *"
                        placeholder="igrovoy-pk-nachalnyy-uroven"
                        error={fieldState.error?.message}
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
                      URL: /catalog/{field.value || "..."}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Subtitle - Modern Floating Label */}
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingTextarea
                        label="Подзаголовок"
                        placeholder="Дополнительное описание сборки (опционально)"
                        error={fieldState.error?.message}
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
                      Максимум 200 символов
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Price */}
                <FormField
                  control={form.control}
                  name="priceBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Базовая цена *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className="border-[#9D4EDD]/20 bg-white/5 pr-8 text-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                            ₽
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-white/60">
                        10,000 - 10,000,000 ₽
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Availability */}
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Доступность *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-[#9D4EDD]/20 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-[#9D4EDD]/20 bg-[#1A1A1A]">
                          <SelectItem value="IN_STOCK" className="text-white">
                            В наличии
                          </SelectItem>
                          <SelectItem value="PREORDER" className="text-white">
                            Предзаказ
                          </SelectItem>
                          <SelectItem
                            value="OUT_OF_STOCK"
                            className="text-white"
                          >
                            Нет в наличии
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Targets (Resolutions) */}
              <FormField
                control={form.control}
                name="targets"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Целевые разрешения *
                    </FormLabel>
                    <div className="flex gap-4">
                      {["FHD", "QHD", "UHD4K"].map((resolution) => (
                        <FormField
                          key={resolution}
                          control={form.control}
                          name="targets"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(resolution as any)}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...current, resolution]);
                                    } else {
                                      field.onChange(
                                        current.filter((r) => r !== resolution)
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-[#9D4EDD]/20 bg-white/5"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal text-white">
                                {resolution}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormDescription className="text-white/60">
                      Выберите хотя бы одно разрешение
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* isTop Switch */}
              <FormField
                control={form.control}
                name="isTop"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-[#9D4EDD]/20 bg-white/5 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">
                        Топовая сборка
                      </FormLabel>
                      <FormDescription className="text-white/60">
                        Отображать в разделе "Топ-4"
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#9D4EDD]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Tab: Медиа - будет в следующем сообщении */}
          <TabsContent
            value="media"
            className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg"
          >
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Медиа контент
              </h3>
              <p className="text-sm text-white/60">
                TODO: Media Library интеграция (Task 22)
              </p>
              <p className="text-sm text-white/60">
                Пока используются временные моки для coverImageId, videoId, gallery
              </p>
            </div>
          </TabsContent>

          {/* Tab: Характеристики */}
          <TabsContent
            value="spec"
            className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg"
          >
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Характеристики железа
              </h3>

              <Separator className="bg-[#9D4EDD]/20" />

              <div className="grid gap-6 md:grid-cols-2">
                {/* CPU - Modern Floating Label */}
                <FormField
                  control={form.control}
                  name="spec.cpu"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput
                          label="Процессор *"
                          placeholder="AMD Ryzen 5 5600"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* GPU - Modern Floating Label */}
                <FormField
                  control={form.control}
                  name="spec.gpu"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput
                          label="Видеокарта *"
                          placeholder="NVIDIA GeForce RTX 4070"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* RAM - Modern Floating Label */}
                <FormField
                  control={form.control}
                  name="spec.ram"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput
                          label="Оперативная память *"
                          placeholder="16GB DDR4 3200MHz"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* SSD - Modern Floating Label */}
                <FormField
                  control={form.control}
                  name="spec.ssd"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput
                          label="Накопитель *"
                          placeholder="512GB NVMe SSD"
                          error={fieldState.error?.message}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Motherboard */}
                <FormField
                  control={form.control}
                  name="spec.motherboard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Материнская плата
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ASUS B550-PLUS (опционально)"
                          {...field}
                          className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PSU */}
                <FormField
                  control={form.control}
                  name="spec.psu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Блок питания
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="650W 80+ Bronze (опционально)"
                          {...field}
                          className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cooling */}
                <FormField
                  control={form.control}
                  name="spec.cooling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Охлаждение</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Башенный кулер (опционально)"
                          {...field}
                          className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Case */}
                <FormField
                  control={form.control}
                  name="spec.case"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Корпус</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ATX Mid Tower (опционально)"
                          {...field}
                          className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Опции */}
          <TabsContent
            value="options"
            className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg"
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Конфигурируемые опции
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Варианты для кастомизации сборки. Дельта цены относительно
                  базовой.
                </p>
              </div>

              {/* RAM Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">
                    Варианты RAM
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendRam({ label: "", sizeGb: 0, delta: 0 })
                    }
                    className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    + Добавить вариант
                  </Button>
                </div>

                <div className="space-y-3">
                  {ramFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-4 md:grid-cols-4"
                    >
                      <FormField
                        control={form.control}
                        name={`options.ram.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Название
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="16GB DDR4"
                                {...field}
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white placeholder:text-white/40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.ram.${index}.sizeGb`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Размер (GB)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.ram.${index}.delta`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Дельта цены (₽)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeRam(index)}
                          className="h-9 w-full"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#9D4EDD]/10" />

              {/* SSD Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">
                    Варианты SSD
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendSsd({ label: "", sizeGb: 0, delta: 0 })
                    }
                    className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    + Добавить вариант
                  </Button>
                </div>

                <div className="space-y-3">
                  {ssdFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-4 md:grid-cols-4"
                    >
                      <FormField
                        control={form.control}
                        name={`options.ssd.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Название
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="512GB NVMe"
                                {...field}
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white placeholder:text-white/40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.ssd.${index}.sizeGb`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Размер (GB)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.ssd.${index}.delta`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Дельта цены (₽)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSsd(index)}
                          className="h-9 w-full"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#9D4EDD]/10" />

              {/* GPU Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">
                    Варианты GPU
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => appendGpu({ label: "", delta: 0 })}
                    className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    + Добавить вариант
                  </Button>
                </div>

                <div className="space-y-3">
                  {gpuFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-4 md:grid-cols-3"
                    >
                      <FormField
                        control={form.control}
                        name={`options.gpu.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Название
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="RTX 4070 Ti"
                                {...field}
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white placeholder:text-white/40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.gpu.${index}.delta`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Дельта цены (₽)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeGpu(index)}
                          className="h-9 w-full"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#9D4EDD]/10" />

              {/* Cooling Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">
                    Варианты охлаждения
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => appendCooling({ label: "", delta: 0 })}
                    className="border-[#9D4EDD]/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    + Добавить вариант
                  </Button>
                </div>

                <div className="space-y-3">
                  {coolingFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-4 md:grid-cols-3"
                    >
                      <FormField
                        control={form.control}
                        name={`options.cooling.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Название
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="СВО 360mm"
                                {...field}
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white placeholder:text-white/40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.cooling.${index}.delta`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/80">
                              Дельта цены (₽)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="h-9 border-[#9D4EDD]/20 bg-white/10 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeCooling(index)}
                          className="h-9 w-full"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
