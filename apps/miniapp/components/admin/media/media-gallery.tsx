"use client";

import { useState, useEffect } from "react";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@vapc/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vapc/ui/components/alert-dialog";
import { ImagePreview } from "./image-preview";
import { toast } from "@/lib/toast";

interface ImageAsset {
  id: string;
  key: string;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  blurhash: string;
  avgColor: string;
  alt: string;
  derivatives: {
    original: { key: string; width: number; height: number; sizeBytes: number };
    sizes: Array<{
      key: string;
      width: number;
      height: number;
      sizeBytes: number;
      suffix: string;
    }>;
  };
  createdAt: string;
}

interface MediaGalleryProps {
  selectMode?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onRefresh?: () => void;
}

/**
 * MediaGallery - Grid view загруженных изображений
 */
export function MediaGallery({
  selectMode = false,
  selectedIds = [],
  onSelect,
  onRefresh,
}: MediaGalleryProps) {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (formatFilter !== "all") {
        params.append("format", formatFilter);
      }

      const response = await fetch(`/api/admin/media?${params}`);
      if (!response.ok) throw new Error("Ошибка загрузки изображений");

      const result = await response.json();
      setImages(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error("Не удалось загрузить изображения");
      console.error("Gallery fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, formatFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/media/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка удаления");
      }

      toast.success("Изображение успешно удалено");
      setDeleteId(null);
      fetchImages();
      onRefresh?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка удаления";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (image: ImageAsset) => {
    const derivative320 = image.derivatives.sizes.find((s) => s.suffix === "320w");
    if (derivative320) {
      return `/uploads/${derivative320.key}`;
    }
    return `/uploads/${image.derivatives.original.key}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все форматы</SelectItem>
            <SelectItem value="WEBP">WebP</SelectItem>
            <SelectItem value="AVIF">AVIF</SelectItem>
            <SelectItem value="JPEG">JPEG</SelectItem>
            <SelectItem value="PNG">PNG</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          Всего изображений: {images.length}
        </p>
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет изображений</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => {
            const isSelected = selectedIds.includes(image.id);
            const imageUrl = getImageUrl(image);

            return (
              <div
                key={image.id}
                className={`group relative border rounded-xl overflow-hidden transition-all
                  ${
                    selectMode
                      ? "cursor-pointer hover:border-violet-500"
                      : "hover:border-border"
                  }
                  ${isSelected ? "border-violet-500 ring-2 ring-violet-500/20" : "border-border"}
                `}
                onClick={() => {
                  if (selectMode) {
                    onSelect?.(image.id);
                  }
                }}
              >
                {/* Image */}
                <div className="aspect-square bg-accent/10">
                  <ImagePreview
                    src={imageUrl}
                    alt={image.alt}
                    blurhash={image.blurhash}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-2 bg-background/95 backdrop-blur-sm">
                  <p className="text-xs text-foreground truncate mb-1" title={image.alt}>
                    {image.alt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{image.format}</span>
                    <span>{formatBytes(image.bytes)}</span>
                  </div>
                </div>

                {/* Select Mode Indicator */}
                {selectMode && (
                  <div className="absolute top-2 right-2">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-violet-500 bg-background rounded-full" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground bg-background/80 rounded-full" />
                    )}
                  </div>
                )}

                {/* Delete Button */}
                {!selectMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 bg-destructive/90 hover:bg-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(image.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Вперед
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить изображение?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Изображение будет удалено из хранилища и базы
              данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
