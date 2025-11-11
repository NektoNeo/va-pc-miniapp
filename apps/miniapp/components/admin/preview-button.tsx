"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@vapc/ui/components/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vapc/ui/components/tooltip";
import { toast } from "@/lib/toast";

type EntityType = "pc" | "promo" | "device" | "category";

type PreviewButtonProps = {
  entityType: EntityType;
  entityId: string | null;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

/**
 * Генерирует Telegram deep-link для предпросмотра в Mini App
 */
function generatePreviewLink(
  entityType: EntityType,
  entityId: string
): string {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "your_bot";
  const payload = `${entityType}_${entityId}`;
  return `https://t.me/${botUsername}/app?startapp=${payload}`;
}

/**
 * PreviewButton - кнопка для предпросмотра в Telegram Mini App
 *
 * @example
 * ```tsx
 * <PreviewButton entityType="pc" entityId={pcId} />
 * ```
 */
export function PreviewButton({
  entityType,
  entityId,
  label = "Preview in Mini App",
  variant = "outline",
  size = "default",
  className,
}: PreviewButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDisabled = !entityId;
  const previewLink = entityId ? generatePreviewLink(entityType, entityId) : "";

  const handleCopy = async () => {
    if (!previewLink) return;

    try {
      await navigator.clipboard.writeText(previewLink);
      setCopied(true);
      toast.success("Ссылка скопирована в буфер обмена");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const handleOpenDialog = () => {
    if (isDisabled) {
      toast.warning("Сохраните элемент перед предпросмотром");
      return;
    }
    setDialogOpen(true);
  };

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleOpenDialog}
      disabled={isDisabled}
      className={className}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  // Если disabled - показываем tooltip с объяснением
  if (isDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>Сохраните элемент перед предпросмотром</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {button}

      {/* Preview Link Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Предпросмотр в Mini App</AlertDialogTitle>
            <AlertDialogDescription>
              Скопируйте ссылку и откройте её в Telegram для предпросмотра
              элемента в Mini App.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Preview Link */}
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3 font-mono text-sm break-all">
              {previewLink}
            </div>

            {/* Copy Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать ссылку
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground">
              💡 Откройте скопированную ссылку в Telegram на телефоне или
              десктопе
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Закрыть</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a
                href={previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                Открыть в новой вкладке
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
