# Performance Optimization Guide

## Route-Level Code Splitting

Next.js automatically code-splits at the route level. For additional optimization, use dynamic imports for heavy components:

### Example: Dynamic Import for Heavy Components

```typescript
// Instead of:
import HeavyComponent from './HeavyComponent';

// Use dynamic import:
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if component is client-only
});
```

### Implemented Optimizations

1. **Automatic Route Splitting**: Each page in `/app` is automatically code-split
2. **Package Optimization**: `lucide-react` and `@vapc/ui` are optimized via `optimizePackageImports`
3. **React Compiler**: Enabled in Next.js 15+ for automatic optimizations

## Image Optimization

### next/image Configuration

Configured in `next.config.ts`:
- **Formats**: AVIF (preferred), WebP fallback
- **Responsive**: Multiple device sizes for optimal loading
- **Caching**: 60-second minimum cache TTL
- **SVG**: Safely enabled with CSP headers

### Usage Example

```typescript
import Image from 'next/image';

<Image
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  priority={false} // Set true for above-the-fold images
  placeholder="blur" // Optional: add blurDataURL
/>
```

## React Memoization

### When to Use memo()

Memoize components that:
1. Render often with the same props
2. Are expensive to render
3. Are pure (same props = same output)

### Example: PCCard Component

```typescript
import { memo } from 'react';

export const PCCard = memo(({ pc }: PCCardProps) => {
  // Component implementation
});
```

### When to Use useMemo()

For expensive calculations:

```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### When to Use useCallback()

For callback functions passed to memoized children:

```typescript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## Bundle Analysis

### Run Bundle Analyzer

```bash
ANALYZE=true pnpm build
```

This opens an interactive treemap showing bundle composition.

### Bundle Size Budgets

Configured in `.bundlesize.json`:
- **JS Chunks**: Max 200kb (gzipped)
- **CSS Files**: Max 50kb (gzipped)

## Performance Budgets

### Critical Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms

### Monitoring

Use Lighthouse CI or Core Web Vitals reporting to track metrics in production.

## Additional Optimizations

1. **Remove Console Logs**: Automatically removed in production builds
2. **Security Headers**: X-Frame-Options, CSP, etc. configured
3. **Prefetch Control**: DNS prefetch enabled for external resources
4. **React Strict Mode**: Enabled for catching potential issues

## Testing Performance

### E2E Performance Testing

See `tests/e2e/*.spec.ts` for Playwright tests with performance checks.

### Bundle Size Testing

Check bundle sizes after every build:

```bash
pnpm build
ls -lh .next/static/chunks/
```
