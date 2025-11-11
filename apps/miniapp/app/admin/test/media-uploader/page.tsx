"use client";

/**
 * Test Page: MediaUploader Component
 * Used exclusively for Playwright section screenshots
 * Route: /admin/test/media-uploader
 */

import { useState } from "react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import type { CompleteUploadResponse } from "@/lib/media/types";

export default function MediaUploaderTestPage() {
  const [uploadedAsset, setUploadedAsset] = useState<CompleteUploadResponse["imageAsset"] | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#18181B] p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">MediaUploader Test Page</h1>
          <p className="mt-2 text-gray-400">For Playwright section screenshots only</p>
        </div>

        {/* Test Controls */}
        <div className="rounded-lg bg-[#27272A] p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Test Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Entity Slug:</span>
              <span className="ml-2 text-white font-mono">test-entity</span>
            </div>
            <div>
              <span className="text-gray-400">Media Kind:</span>
              <span className="ml-2 text-white font-mono">cover</span>
            </div>
          </div>
        </div>

        {/* MediaUploader Component - Main Test Section */}
        <div
          data-testid="media-uploader-section"
          className="rounded-lg bg-[#27272A] p-8 border border-gray-800"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Upload Section</h2>

          <MediaUploader
            kind="cover"
            entitySlug="test-entity"
            onUploadComplete={(asset) => {
              setUploadedAsset(asset);
              setUploadError(null);
            }}
            onUploadError={(error) => {
              setUploadError(error);
              setUploadedAsset(null);
            }}
          />
        </div>

        {/* Upload Result Display */}
        {uploadedAsset && (
          <div
            data-testid="upload-success-section"
            className="rounded-lg bg-green-900/20 border border-green-700 p-6"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">Upload Success</h3>
            <pre className="text-xs text-green-300 overflow-x-auto">
              {JSON.stringify(uploadedAsset, null, 2)}
            </pre>
          </div>
        )}

        {uploadError && (
          <div
            data-testid="upload-error-section"
            className="rounded-lg bg-red-900/20 border border-red-700 p-6"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-4">Upload Error</h3>
            <p className="text-sm text-red-300">{uploadError}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-lg bg-violet-900/20 border border-violet-700 p-6">
          <h3 className="text-lg font-semibold text-violet-400 mb-3">Test Instructions</h3>
          <ul className="space-y-2 text-sm text-violet-300">
            <li>• This page is for Playwright E2E testing only</li>
            <li>• Screenshots should capture SECTIONS, not full page</li>
            <li>• Test different states: idle, uploading, error, success</li>
            <li>• Validate alt text input (max 140 chars)</li>
            <li>• Validate file drag & drop interactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
