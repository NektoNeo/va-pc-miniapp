"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

/**
 * Telegraph Links Type
 */
type TelegraphLinks = {
  privacy: string;
  offer: string;
  pd_consent: string;
  review_consent: string;
  faq: string;
};

interface TelegraphLinksEditorProps {
  initialLinks: TelegraphLinks;
}

/**
 * Настройки полей Telegraph ссылок
 */
const TELEGRAPH_FIELDS = [
  {
    key: "privacy" as keyof TelegraphLinks,
    label: "Политика конфиденциальности",
    description: "Ссылка на политику обработки персональных данных",
    placeholder: "https://telegra.ph/privacy-policy-01-01",
  },
  {
    key: "offer" as keyof TelegraphLinks,
    label: "Договор оферты",
    description: "Публичная оферта на оказание услуг",
    placeholder: "https://telegra.ph/public-offer-01-01",
  },
  {
    key: "pd_consent" as keyof TelegraphLinks,
    label: "Согласие на обработку ПД",
    description: "Согласие на обработку персональных данных",
    placeholder: "https://telegra.ph/pd-consent-01-01",
  },
  {
    key: "review_consent" as keyof TelegraphLinks,
    label: "Согласие на публикацию отзыва",
    description: "Согласие на размещение отзыва и фотографий",
    placeholder: "https://telegra.ph/review-consent-01-01",
  },
  {
    key: "faq" as keyof TelegraphLinks,
    label: "Частые вопросы (FAQ)",
    description: "Ответы на популярные вопросы пользователей",
    placeholder: "https://telegra.ph/faq-01-01",
  },
];

/**
 * Telegraph Link Input Component
 */
function TelegraphLinkInput({
  field,
  value,
  onChange,
  hasError,
}: {
  field: (typeof TELEGRAPH_FIELDS)[0];
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
}) {
  const isEmpty = value.trim() === "";

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        hasError
          ? "border-red-500/40 bg-red-500/5"
          : "border-[#9D4EDD]/20 bg-white/5"
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#9D4EDD]" />
            <label className="text-sm font-medium text-white">
              {field.label}
            </label>
          </div>
          <p className="mt-1 text-xs text-white/40">{field.description}</p>
        </div>

        {/* Preview Link */}
        {!isEmpty && !hasError && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            title="Открыть в новой вкладке"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Input */}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition-all focus:border-[#9D4EDD]/60 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20"
        placeholder={field.placeholder}
      />

      {/* Error Message */}
      {hasError && (
        <p className="mt-2 text-xs text-red-400">
          Некорректный URL. Используйте формат: https://telegra.ph/...
        </p>
      )}
    </div>
  );
}

/**
 * Telegraph Links Editor Component
 */
export function TelegraphLinksEditor({
  initialLinks,
}: TelegraphLinksEditorProps) {
  const router = useRouter();
  const [links, setLinks] = useState<TelegraphLinks>(initialLinks);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Валидация URL
   */
  const isValidUrl = (url: string): boolean => {
    if (url.trim() === "") return true; // Пустые URL разрешены

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  /**
   * Изменение ссылки
   */
  const handleChangeLink = (key: keyof TelegraphLinks, value: string) => {
    setLinks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Валидация всех ссылок
   */
  const validateLinks = (): string | null => {
    for (const field of TELEGRAPH_FIELDS) {
      const url = links[field.key];
      if (!isValidUrl(url)) {
        return `${field.label}: некорректный URL`;
      }
    }
    return null;
  };

  /**
   * Сохранение ссылок
   */
  const handleSave = async () => {
    // Валидация
    const error = validateLinks();
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
          telegraph: links,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка при сохранении настроек");
        return;
      }

      toast.success("Telegraph ссылки успешно сохранены");
      router.refresh();
    } catch (error) {
      console.error("[Telegraph Links Editor] Save error:", error);
      toast.error("Произошла ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  // Проверка на изменения
  const hasChanges = JSON.stringify(links) !== JSON.stringify(initialLinks);

  // Проверка наличия ошибок в ссылках
  const linkErrors = TELEGRAPH_FIELDS.reduce(
    (acc, field) => {
      acc[field.key] = !isValidUrl(links[field.key]);
      return acc;
    },
    {} as Record<keyof TelegraphLinks, boolean>
  );

  const hasErrors = Object.values(linkErrors).some((error) => error);

  return (
    <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Юридические документы
          </h2>
          <p className="text-sm text-white/60">
            Ссылки на Telegraph страницы с документами
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || hasErrors}
          className="inline-flex items-center gap-2 rounded-lg border border-[#9D4EDD]/20 bg-[#9D4EDD] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#9D4EDD]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {TELEGRAPH_FIELDS.map((field) => (
          <TelegraphLinkInput
            key={field.key}
            field={field}
            value={links[field.key]}
            onChange={(value) => handleChangeLink(field.key, value)}
            hasError={linkErrors[field.key]}
          />
        ))}
      </div>

      {/* Hint */}
      <div className="mt-4 rounded-lg border border-[#9D4EDD]/10 bg-white/5 p-3">
        <p className="text-xs text-white/40">
          💡 <span className="font-medium text-white/60">Совет:</span> Создайте
          страницы на{" "}
          <a
            href="https://telegra.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9D4EDD] hover:underline"
          >
            telegra.ph
          </a>{" "}
          и вставьте ссылки сюда. Они будут отображаться в Mini App в формах
          заказа и согласиях.
        </p>
      </div>
    </div>
  );
}
