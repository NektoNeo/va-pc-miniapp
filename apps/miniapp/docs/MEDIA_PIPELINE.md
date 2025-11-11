# Media Pipeline Documentation

## Overview

Robust media processing pipeline for VA-PC with image/video upload, validation, processing, and storage on S3/Cloudflare R2.

## Architecture

### Upload Flow

1. **Client requests signed URL** via `POST /api/media/sign`
   - Validates file metadata (size, type, kind)
   - Returns signed S3 PUT URL (10min expiry)

2. **Client uploads directly to S3** using signed URL
   - No server bandwidth used
   - Fast parallel uploads

3. **Client confirms upload** via `POST /api/media/complete`
   - Server downloads from S3
   - Validates content (MIME, aspect ratio, dimensions)
   - Processes image (derivatives, blurhash, colors)
   - Uploads derivatives back to S3
   - Creates Prisma ImageAsset record

### Processing Pipeline

**Sharp Pipeline:**
- Convert to sRGB color space
- Strip unsafe EXIF (keep orientation)
- Generate 4 sizes: 320px, 640px, 1280px, 2048px
- Output formats: AVIF + WEBP (8 files total)
- Generate blurhash for progressive loading
- Extract average color for skeletons

## Validation Rules

### Image Formats
- **Accepted:** JPEG, PNG, WebP, AVIF
- **Output:** AVIF + WebP derivatives
- **Blocked:** SVG (security risk)

### File Size Limits
- Images: **10MB max** (hard), 4MB preferred
- Videos: **100MB max**

### Aspect Ratios

| Kind | Ratio | Tolerance | Min Dimensions |
|------|-------|-----------|----------------|
| cover | 4:5 or 3:4 | ±5% | 1200×1500 / 1200×1600 |
| gallery | 16:9 or 3:2 | ±5% | 1920×1080 / 1800×1200 |
| promo | 16:9 | ±3% | 1920×1080 |
| device | 1:1 | ±3% | 1200×1200 |

### Alt Text
- **Required:** Yes
- **Max length:** 140 characters
- **Pattern:** English + Russian letters, numbers, basic punctuation

## Brand Color Validation

Analyzes dominant hue:
- **Blocked:** Yellow (45-65°) ⚠️
- **Preferred:** Violet (270-300°) or neutral/dark
- **Warns:** if deviates from brand palette

## S3/R2 Storage

### Naming Convention
```
${entitySlug}__${kind}__${size|original}.${ext}?v=${hash}
```

Examples:
- `gaming-beast-pro__cover__original.jpg`
- `gaming-beast-pro__cover__320w.avif?v=a3f2c8b1`
- `gaming-beast-pro__gallery__1280w.webp?v=a3f2c8b1`

### CDN Cache Headers
- **Derivatives:** `public, max-age=31536000, immutable` (1 year)
- **Originals:** `public, max-age=604800` (7 days)

## API Endpoints

### POST /api/media/sign
Request signed upload URL.

**Request:**
```json
{
  "filename": "hero-image.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 3500000,
  "kind": "cover",
  "entitySlug": "gaming-beast-pro"
}
```

**Response:**
```json
{
  "uploadId": "clxxx",
  "uploadUrl": "https://r2.../presigned-put",
  "key": "gaming-beast-pro__cover__upload",
  "expiresIn": 600
}
```

### POST /api/media/complete
Complete upload and process image.

**Request:**
```json
{
  "uploadId": "clxxx",
  "alt": "Gaming Beast Pro hero shot with RGB lighting"
}
```

**Response:**
```json
{
  "imageAsset": {
    "id": "clyyy",
    "key": "gaming-beast-pro__cover",
    "width": 3840,
    "height": 4800,
    "blurhash": "LEHV6nWB...",
    "avgColor": "#1a0b2e",
    "derivatives": { ... },
    "cdnUrl": "https://cdn.va-pc.ru/gaming-beast-pro__cover__1280w.avif?v=a3f2c8b1"
  }
}
```

### DELETE /api/media/delete
Delete asset and all derivatives.

**Request:**
```json
{
  "assetId": "clyyy",
  "type": "image"
}
```

**Response:**
```json
{
  "success": true,
  "deletedKeys": ["key1", "key2", ...]
}
```

## Environment Variables

```env
S3_BUCKET_NAME=va-pc-media
S3_REGION=auto
S3_ENDPOINT=https://[account].r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
CDN_BASE_URL=https://cdn.va-pc.ru
```

## Error Codes

| Code | Message |
|------|---------|
| FILE_TOO_LARGE | File exceeds size limit |
| UNSUPPORTED_MIME_TYPE | MIME type not allowed |
| BLOCKED_MIME_TYPE | SVG or other blocked type |
| INVALID_ASPECT_RATIO | Dimensions don't match requirements |
| DIMENSIONS_TOO_SMALL | Below minimum size |
| ALT_REQUIRED | Alt text is required |
| ALT_TOO_LONG | Alt text exceeds 140 chars |
| PROCESSING_ERROR | Failed to process image |

## Usage in Admin Panel

```tsx
import { MediaUploader } from "@/components/admin/MediaUploader";

<MediaUploader
  kind="cover"
  entitySlug="gaming-beast-pro"
  onUploadComplete={(asset) => {
    console.log("Uploaded:", asset);
  }}
/>
```

## Performance

- **Parallel processing:** All derivatives generated concurrently
- **Streaming:** Large files streamed from/to S3
- **Timeouts:** 60s route timeout for processing
- **Bundle size:** Sharp is server-side only (0KB client bundle)

## Security

✅ MIME verification with magic bytes
✅ SVG uploads blocked
✅ Signed URLs with 10min expiry
✅ EXIF stripped (except orientation)
✅ sRGB color space conversion
✅ Content-Type validation
✅ Server-side size verification

## Next Steps

**TODO for production:**
- [ ] Implement API routes (sign, complete, delete)
- [ ] Add admin MediaUploader React component
- [ ] Write unit tests (validators, MIME detection)
- [ ] Add BullMQ queue for async processing
- [ ] Implement rate limiting
- [ ] Add video poster generation (ffmpeg)
- [ ] CDN invalidation on file replacement
- [ ] Playwright section screenshots for uploader UI
