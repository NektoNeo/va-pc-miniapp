"use client";

/**
 * MediaUploader Component
 * Drag & drop uploader with validation, progress tracking, and preview
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { MediaKind, CompleteUploadResponse } from "@/lib/media/types";
import { FILE_SIZE_LIMITS } from "@/lib/media/types";

interface MediaUploaderProps {
  kind: MediaKind;
  entitySlug: string;
  onUploadComplete: (asset: CompleteUploadResponse["imageAsset"]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadState {
  status: "idle" | "signing" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  warnings?: string[];
}

export function MediaUploader({
  kind,
  entitySlug,
  onUploadComplete,
  onUploadError,
}: MediaUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        // Reset state
        setUploadState({ status: "signing", progress: 0 });
        setPreview(URL.createObjectURL(file));

        // Step 1: Request signed upload URL
        const signResponse = await fetch("/api/media/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
            kind,
            entitySlug,
          }),
        });

        if (!signResponse.ok) {
          const error = await signResponse.json();
          throw new Error(error.details?.[0]?.message || error.error || "Failed to get upload URL");
        }

        const { uploadId, uploadUrl } = await signResponse.json();

        // Step 2: Upload directly to S3
        setUploadState({ status: "uploading", progress: 0 });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to S3");
        }

        setUploadState({ status: "uploading", progress: 100 });

        // Step 3: Complete upload (process image)
        setUploadState({ status: "processing", progress: 0 });

        const completeResponse = await fetch("/api/media/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId,
            alt: altText || file.name,
          }),
        });

        if (!completeResponse.ok) {
          const error = await completeResponse.json();
          throw new Error(error.details?.[0]?.message || error.error || "Failed to process upload");
        }

        const result: CompleteUploadResponse = await completeResponse.json();

        setUploadState({
          status: "completed",
          progress: 100,
          warnings: result.warnings,
        });

        onUploadComplete(result.imageAsset);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadState({
          status: "error",
          progress: 0,
          error: errorMessage,
        });
        onUploadError?.(errorMessage);
      }
    },
    [kind, entitySlug, altText, onUploadComplete, onUploadError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
    maxSize: FILE_SIZE_LIMITS.IMAGE_MAX,
    maxFiles: 1,
    disabled: uploadState.status !== "idle",
  });

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* Alt Text Input */}
      <div>
        <label htmlFor="alt-text" className="block text-sm font-medium mb-2">
          Alt Text (Required, max 140 chars)
        </label>
        <input
          id="alt-text"
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value.slice(0, 140))}
          placeholder="Describe the image for accessibility..."
          className="w-full px-4 py-2 border rounded-lg"
          maxLength={140}
          disabled={uploadState.status !== "idle"}
        />
        <p className="text-sm text-gray-500 mt-1">{altText.length}/140 characters</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? "border-violet-500 bg-violet-50" : "border-gray-300"}
          ${uploadState.status !== "idle" ? "opacity-50 cursor-not-allowed" : "hover:border-violet-400"}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-violet-600">Drop the image here...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop an image, or click to select</p>
            <p className="text-sm text-gray-400 mt-2">
              JPEG, PNG, WebP, AVIF • Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img src={preview} alt="Upload preview" className="w-full h-64 object-cover rounded-lg" />
        </div>
      )}

      {/* Progress */}
      {uploadState.status !== "idle" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{uploadState.status}</span>
            <span>{uploadState.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Warnings */}
      {uploadState.warnings && uploadState.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800">Warnings:</p>
          <ul className="mt-2 space-y-1">
            {uploadState.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-yellow-700">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Error:</p>
          <p className="text-sm text-red-700 mt-1">{uploadState.error}</p>
        </div>
      )}

      {/* Success */}
      {uploadState.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">✓ Upload completed successfully!</p>
        </div>
      )}
    </div>
  );
}
