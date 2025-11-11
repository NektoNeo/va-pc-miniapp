"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/validations/pc-builds";
import type { Prisma } from "@prisma/client";

/**
 * PC Build List Item Type
 */
type PCBuildListItem = Prisma.PcBuildGetPayload<{
  select: {
    id: true;
    title: true;
    subtitle: true;
    priceBase: true;
    coverImage: {
      select: {
        id: true;
        key: true;
        avgColor: true;
      };
    };
  };
}>;

interface TopProductsEditorProps {
  initialTopPcIds: string[];
  initialTopDeviceIds: string[];
  availablePCBuilds: PCBuildListItem[];
}

/**
 * Sortable Item Component
 */
function SortableProductCard({
  id,
  product,
  onRemove,
}: {
  id: string;
  product: PCBuildListItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border border-[#9D4EDD]/20 bg-white/5 p-3 backdrop-blur-lg transition-all hover:border-[#9D4EDD]/40"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center text-white/40 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Cover Image Preview */}
      {product.coverImage && (
        <div
          className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#9D4EDD]/20"
          style={{
            backgroundColor: product.coverImage.avgColor || "#9D4EDD20",
          }}
        />
      )}

      {/* Product Info */}
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{product.title}</p>
        {product.subtitle && (
          <p className="text-xs text-white/40">{product.subtitle}</p>
        )}
        <p className="mt-1 text-xs font-mono text-white/60">
          {formatPrice(product.priceBase)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="rounded-lg p-2 text-white/40 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        title="Удалить"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Add Product Selector Component
 */
function AddProductSelector({
  availableProducts,
  selectedIds,
  onAdd,
}: {
  availableProducts: PCBuildListItem[];
  selectedIds: string[];
  onAdd: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Фильтруем только товары, которые ещё не добавлены
  const filteredProducts = availableProducts.filter(
    (p) => !selectedIds.includes(p.id)
  );

  if (filteredProducts.length === 0) {
    return null; // Нечего добавлять
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
      >
        <Plus className="h-4 w-4" />
        Добавить товар
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute left-0 top-full z-20 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-[#9D4EDD]/20 bg-[#1A1A1A] p-2 shadow-2xl">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onAdd(product.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all hover:bg-white/5"
              >
                {product.coverImage && (
                  <div
                    className="h-10 w-10 flex-shrink-0 rounded-lg border border-[#9D4EDD]/20"
                    style={{
                      backgroundColor:
                        product.coverImage.avgColor || "#9D4EDD20",
                    }}
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {product.title}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatPrice(product.priceBase)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Top Products Editor Component
 */
export function TopProductsEditor({
  initialTopPcIds,
  initialTopDeviceIds,
  availablePCBuilds,
}: TopProductsEditorProps) {
  const router = useRouter();
  const [topPcIds, setTopPcIds] = useState<string[]>(initialTopPcIds);
  const [isSaving, setIsSaving] = useState(false);

  // Sensors для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Обработчик окончания drag операции
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setTopPcIds((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  /**
   * Добавление товара в Top-4
   */
  const handleAddProduct = (id: string) => {
    if (topPcIds.length >= 4) {
      toast.error("Максимум 4 товара в Top списке");
      return;
    }

    setTopPcIds((prev) => [...prev, id]);
  };

  /**
   * Удаление товара из Top-4
   */
  const handleRemoveProduct = (id: string) => {
    setTopPcIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  /**
   * Сохранение настроек
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topPcIds,
          topDeviceIds: initialTopDeviceIds, // Пока не меняем
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка при сохранении настроек");
        return;
      }

      toast.success("Настройки успешно сохранены");
      router.refresh();
    } catch (error) {
      console.error("[Top Products Editor] Save error:", error);
      toast.error("Произошла ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  // Получаем объекты продуктов для отображения
  const topProducts = topPcIds
    .map((id) => availablePCBuilds.find((p) => p.id === id))
    .filter(Boolean) as PCBuildListItem[];

  // Проверка на изменения
  const hasChanges =
    JSON.stringify(topPcIds) !== JSON.stringify(initialTopPcIds);

  return (
    <div className="space-y-6">
      {/* Top-4 PC Builds Section */}
      <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Top-4 сборок ПК
            </h2>
            <p className="text-sm text-white/60">
              Перетащите товары для изменения порядка ({topPcIds.length}/4)
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-lg border border-[#9D4EDD]/20 bg-[#9D4EDD] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#9D4EDD]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        {/* Sortable List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={topPcIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {topProducts.map((product) => (
                <SortableProductCard
                  key={product.id}
                  id={product.id}
                  product={product}
                  onRemove={() => handleRemoveProduct(product.id)}
                />
              ))}

              {topProducts.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#9D4EDD]/20 bg-white/5 p-8 text-center">
                  <p className="text-sm text-white/60">
                    Список Top-4 пуст. Добавьте первый товар.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Product Button */}
        {topPcIds.length < 4 && (
          <div className="mt-4">
            <AddProductSelector
              availableProducts={availablePCBuilds}
              selectedIds={topPcIds}
              onAdd={handleAddProduct}
            />
          </div>
        )}
      </div>

      {/* Top-4 Devices Section - Placeholder */}
      <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Top-4 устройств
          </h2>
          <p className="text-sm text-white/60">
            Будет реализовано после создания Devices CRUD (Task 18)
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-[#9D4EDD]/20 bg-white/5 p-8 text-center">
          <p className="text-sm text-white/40">
            Devices management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
