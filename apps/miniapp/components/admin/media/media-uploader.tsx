"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@vapc/ui/components/button";
import { Input } from "@vapc/ui/components/input";
import { Label } from "@vapc/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { ImagePreview } from "./image-preview";

interface UploadedImage {
  id: string;
  url: string;
  blurhash: string;
  width: number;
  height: number;
  alt: string;
}

interface MediaUploaderProps {
  onUploadSuccess?: (image: UploadedImage) => void;
  onUploadError?: (error: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];

/**
 * MediaUploader - Drag-and-drop компонент для загрузки изображений
 */
export function MediaUploader({ onUploadSuccess, onUploadError }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [format, setFormat] = useState<"WEBP" | "AVIF" | "JPEG" | "PNG">("WEBP");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setUploadedImage(null);

    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Файл слишком большой. Максимум 10 МБ.");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Неподдерживаемый формат. Разрешены: JPEG, PNG, WebP, AVIF.");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Выберите файл");
      return;
    }

    if (!altText.trim()) {
      setError("Alt текст обязателен");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", altText.trim());
      formData.append("format", format);

      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка загрузки");
      }

      const result = await response.json();
      const imageData = result.data;

      // Get derivative URL (use 640w for preview)
      const derivative640 = imageData.derivatives.sizes.find(
        (s: any) => s.suffix === "640w"
      );
      const imageUrl = derivative640
        ? `/uploads/${derivative640.key}`
        : `/uploads/${imageData.derivatives.original.key}`;

      const uploadedData: UploadedImage = {
        id: imageData.id,
        url: imageUrl,
        blurhash: imageData.blurhash,
        width: imageData.width,
        height: imageData.height,
        alt: imageData.alt,
      };

      setUploadedImage(uploadedData);
      onUploadSuccess?.(uploadedData);

      // Reset form
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setAltText("");
        setUploadProgress(0);
        setIsUploading(false);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки";
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setAltText("");
    setError(null);
    setUploadedImage(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!file && !uploadedImage && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${
              isDragActive
                ? "border-violet-500 bg-violet-950/20"
                : "border-border hover:border-violet-500/50 hover:bg-accent/5"
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-foreground mb-1">
            {isDragActive
              ? "Отпустите файл для загрузки"
              : "Перетащите изображение или нажмите для выбора"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, AVIF (макс. 10 МБ)
          </p>
        </div>
      )}

      {/* Preview + Form */}
      {file && preview && !uploadedImage && (
        <div className="border rounded-xl p-4 space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden bg-accent/10">
            <img src={preview} alt="Preview" className="w-full h-auto" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={handleClear}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="alt">Alt текст *</Label>
              <Input
                id="alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Описание изображения для доступности"
                maxLength={140}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {altText.length}/140 символов
              </p>
            </div>

            <div>
              <Label htmlFor="format">Формат</Label>
              <Select
                value={format}
                onValueChange={(value: any) => setFormat(value)}
                disabled={isUploading}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBP">WebP (рекомендуется)</SelectItem>
                  <SelectItem value="AVIF">AVIF (наименьший размер)</SelectItem>
                  <SelectItem value="JPEG">JPEG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Загрузка... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={isUploading || !altText.trim()}
              className="w-full"
            >
              {isUploading ? "Загрузка..." : "Загрузить"}
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadedImage && (
        <div className="border border-green-500/20 rounded-xl p-4 bg-green-950/10">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500">
                Изображение успешно загружено
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ID: {uploadedImage.id}
              </p>
            </div>
          </div>

          <ImagePreview
            src={uploadedImage.url}
            alt={uploadedImage.alt}
            blurhash={uploadedImage.blurhash}
            width={uploadedImage.width}
            height={uploadedImage.height}
            className="rounded-lg overflow-hidden"
          />

          <Button onClick={handleClear} variant="outline" className="w-full mt-3">
            Загрузить еще
          </Button>
        </div>
      )}
    </div>
  );
}
