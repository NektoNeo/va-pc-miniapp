"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/validations/pc-builds";

/**
 * Budget Preset Type
 * Tuple of [minPrice, maxPrice]
 */
type BudgetPreset = [number, number];

interface BudgetPresetsEditorProps {
  initialPresets: BudgetPreset[];
}

/**
 * Budget Preset Item Component
 */
function BudgetPresetItem({
  preset,
  index,
  onChange,
  onRemove,
  hasError,
}: {
  preset: BudgetPreset;
  index: number;
  onChange: (index: number, preset: BudgetPreset) => void;
  onRemove: (index: number) => void;
  hasError: boolean;
}) {
  const [min, max] = preset;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
        hasError
          ? "border-red-500/40 bg-red-500/5"
          : "border-[#9D4EDD]/20 bg-white/5 hover:border-[#9D4EDD]/40"
      }`}
    >
      {/* Index Badge */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#9D4EDD]/20 text-sm font-medium text-white">
        {index + 1}
      </div>

      {/* Min Price Input */}
      <div className="flex-1">
        <label className="mb-1 block text-xs text-white/40">От (₽)</label>
        <input
          type="number"
          min="1"
          step="1000"
          value={min}
          onChange={(e) => {
            const newMin = parseInt(e.target.value) || 0;
            onChange(index, [newMin, max]);
          }}
          className="w-full rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition-all focus:border-[#9D4EDD]/60 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20"
          placeholder="46000"
        />
      </div>

      {/* Separator */}
      <div className="text-white/40">—</div>

      {/* Max Price Input */}
      <div className="flex-1">
        <label className="mb-1 block text-xs text-white/40">До (₽)</label>
        <input
          type="number"
          min="1"
          step="1000"
          value={max}
          onChange={(e) => {
            const newMax = parseInt(e.target.value) || 0;
            onChange(index, [min, newMax]);
          }}
          className="w-full rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition-all focus:border-[#9D4EDD]/60 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20"
          placeholder="100000"
        />
      </div>

      {/* Preview */}
      <div className="flex-1">
        <label className="mb-1 block text-xs text-white/40">Отображение</label>
        <div className="rounded-lg bg-white/5 px-3 py-2 text-sm font-mono text-white">
          {formatPrice(min)} - {formatPrice(max)}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(index)}
        className="rounded-lg p-2 text-white/40 transition-all hover:bg-red-500/20 hover:text-red-400"
        title="Удалить пресет"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Budget Presets Editor Component
 */
export function BudgetPresetsEditor({
  initialPresets,
}: BudgetPresetsEditorProps) {
  const router = useRouter();
  const [presets, setPresets] = useState<BudgetPreset[]>(initialPresets);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Валидация пресетов
   */
  const validatePresets = (): string | null => {
    if (presets.length === 0) {
      return "Необходим хотя бы один бюджетный пресет";
    }

    if (presets.length > 10) {
      return "Максимум 10 бюджетных пресетов";
    }

    for (let i = 0; i < presets.length; i++) {
      const [min, max] = presets[i];

      if (min <= 0 || max <= 0) {
        return `Пресет ${i + 1}: цены должны быть положительными`;
      }

      if (max <= min) {
        return `Пресет ${i + 1}: максимальная цена должна быть больше минимальной`;
      }
    }

    return null;
  };

  /**
   * Добавление нового пресета
   */
  const handleAddPreset = () => {
    if (presets.length >= 10) {
      toast.error("Максимум 10 бюджетных пресетов");
      return;
    }

    // Добавляем пресет на основе последнего
    const lastPreset = presets[presets.length - 1];
    const newMin = lastPreset ? lastPreset[1] : 46000;
    const newMax = newMin + 50000;

    setPresets((prev) => [...prev, [newMin, newMax]]);
  };

  /**
   * Изменение пресета
   */
  const handleChangePreset = (index: number, preset: BudgetPreset) => {
    setPresets((prev) => {
      const updated = [...prev];
      updated[index] = preset;
      return updated;
    });
  };

  /**
   * Удаление пресета
   */
  const handleRemovePreset = (index: number) => {
    if (presets.length <= 1) {
      toast.error("Необходим хотя бы один пресет");
      return;
    }

    setPresets((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Сохранение пресетов
   */
  const handleSave = async () => {
    // Валидация
    const error = validatePresets();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetPresets: presets,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка при сохранении настроек");
        return;
      }

      toast.success("Бюджетные пресеты успешно сохранены");
      router.refresh();
    } catch (error) {
      console.error("[Budget Presets Editor] Save error:", error);
      toast.error("Произошла ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  // Проверка на изменения
  const hasChanges =
    JSON.stringify(presets) !== JSON.stringify(initialPresets);

  // Проверка наличия ошибок в пресетах
  const presetErrors = presets.map(([min, max]) => max <= min || min <= 0 || max <= 0);

  return (
    <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Бюджетные фильтры
          </h2>
          <p className="text-sm text-white/60">
            Настройка ценовых диапазонов для фильтрации ({presets.length}/10)
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

      {/* Presets List */}
      <div className="space-y-3">
        {presets.map((preset, index) => (
          <BudgetPresetItem
            key={index}
            preset={preset}
            index={index}
            onChange={handleChangePreset}
            onRemove={handleRemovePreset}
            hasError={presetErrors[index]}
          />
        ))}
      </div>

      {/* Add Preset Button */}
      {presets.length < 10 && (
        <div className="mt-4">
          <button
            onClick={handleAddPreset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Добавить пресет
          </button>
        </div>
      )}

      {/* Hint */}
      <div className="mt-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-3">
        <p className="text-xs text-white/40">
          💡 <span className="font-medium text-white/60">Совет:</span> Пресеты
          используются для быстрой фильтрации товаров по цене в Mini App.
          Рекомендуется создавать непересекающиеся диапазоны.
        </p>
      </div>
    </div>
  );
}
