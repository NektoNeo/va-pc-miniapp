"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@vapc/ui/components/dialog";
import { Button } from "@vapc/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vapc/ui/components/tabs";
import { MediaGallery } from "./media-gallery";
import { MediaUploader } from "./media-uploader";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageIds: string[]) => void;
  multiple?: boolean;
  title?: string;
}

/**
 * MediaPicker - Modal для выбора изображений из галереи
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  title = "Выбрать изображение",
}: MediaPickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelect = (id: string) => {
    if (multiple) {
      // Toggle selection
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      // Single selection
      setSelectedIds([id]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedIds);
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleUploadSuccess = () => {
    // Refresh gallery after upload
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Галерея</TabsTrigger>
            <TabsTrigger value="upload">Загрузить</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="flex-1 overflow-y-auto mt-4">
            <MediaGallery
              key={refreshTrigger}
              selectMode
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </TabsContent>

          <TabsContent value="upload" className="flex-1 overflow-y-auto mt-4">
            <MediaUploader onUploadSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Выбрать ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
