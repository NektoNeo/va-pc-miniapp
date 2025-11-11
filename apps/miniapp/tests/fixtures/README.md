# Test Fixtures

This directory contains test files for Playwright E2E tests.

## Image Files Needed

For the MediaUploader tests to work properly, you need to add test image files:

### Required Files:

1. **test-image.jpg** - Valid JPEG image
   - Dimensions: 1200x1500 (4:5 ratio for cover kind)
   - Size: < 10MB
   - Use for: Valid upload tests

2. **test-image-large.jpg** - Oversized image
   - Size: > 10MB
   - Use for: File size validation tests

3. **test-image-wrong-ratio.jpg** - Wrong aspect ratio
   - Dimensions: 1000x1000 (1:1 ratio, invalid for cover kind)
   - Use for: Aspect ratio validation tests

4. **test-image.png** - Valid PNG image
   - Dimensions: 1200x1600 (3:4 ratio for cover kind)
   - Size: < 10MB
   - Use for: PNG format tests

5. **test-image.webp** - Valid WebP image
   - Dimensions: 1920x1080 (16:9 ratio for gallery kind)
   - Size: < 10MB
   - Use for: WebP format tests

## Creating Test Images

You can create test images using ImageMagick:

```bash
# Create 1200x1500 JPEG (4:5 ratio)
convert -size 1200x1500 xc:#8B5CF6 test-image.jpg

# Create 1200x1600 PNG (3:4 ratio)
convert -size 1200x1600 xc:#8B5CF6 test-image.png

# Create 1920x1080 WebP (16:9 ratio)
convert -size 1920x1080 xc:#8B5CF6 test-image.webp

# Create oversized image (15MB)
convert -size 4000x5000 xc:#8B5CF6 -quality 100 test-image-large.jpg

# Create wrong ratio (1:1)
convert -size 1000x1000 xc:#8B5CF6 test-image-wrong-ratio.jpg
```

## Notes

- All test images use violet (#8B5CF6) as the primary color to match brand guidelines
- Images should NOT contain yellow colors for brand validation tests
- Keep test files in this directory and add them to `.gitignore` if they're large
