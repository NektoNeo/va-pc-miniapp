"use client";

import { useState } from "react";
import { Card } from "@vapc/ui/components/card";
import { Button } from "@vapc/ui/components/button";
import { Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "@/lib/toast";

export type MediaItem = {
  id: string;
  key: string;
  url: string;
  size: number;
  mimeType: string;
  avgColor: string | null;
  blurHash: string | null;
  createdAt: Date;
};

type MediaCardProps = {
  item: MediaItem;
  onDelete?: (id: string) => Promise<void>;
  showActions?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export function MediaCard({
  item,
  onDelete,
  showActions = true,
  selected = false,
  onSelect,
}: MediaCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImage = item.mimeType.startsWith("image/");
  const isSvg = item.mimeType === "image/svg+xml";

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setDeleting(true);
      await onDelete(item.id);
      toast.success("Файл удалён");
    } catch (error) {
      toast.error("Ошибка при удалении файла");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      toast.success("URL скопирован в буфер обмена");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Не удалось скопировать URL");
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg ${
        selected
          ? "ring-2 ring-[#9D4EDD] bg-[#9D4EDD]/5"
          : "bg-[#1A1A1A]/80 hover:bg-[#1A1A1A]"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      {/* Preview зона */}
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{
          backgroundColor: item.avgColor || "#2A2A2A",
        }}
      >
        {isImage && !isSvg ? (
          <img
            src={item.url}
            alt={item.key}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : isSvg ? (
          <div className="flex h-full items-center justify-center bg-[#2A2A2A] p-4">
            <img
              src={item.url}
              alt={item.key}
              className="max-h-full max-w-full"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">
            <p className="text-sm">{item.mimeType}</p>
          </div>
        )}

        {/* Hover overlay с actions */}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, "_blank");
              }}
              title="Открыть в новой вкладке"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyUrl();
              }}
              title="Скопировать URL"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={deleting}
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#9D4EDD] text-white shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-1 p-3">
        <p
          className="truncate text-sm font-medium text-white"
          title={item.key}
        >
          {item.key}
        </p>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{formatFileSize(item.size)}</span>
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
