# Testing & QA Documentation

## Overview

This project includes comprehensive testing coverage with:
- **Playwright E2E Tests**: Critical user flows
- **Vitest Unit Tests**: Store logic and component behavior
- **Performance Budgets**: Bundle size monitoring
- **React Memoization**: Performance optimization

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
pnpm playwright:install

# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e tests/e2e/home.spec.ts
```

### Run All Tests

```bash
pnpm test:all
```

## Test Structure

```
tests/
├── e2e/                          # Playwright E2E tests
│   ├── home.spec.ts             # Home page tiles
│   ├── pcs-filter.spec.ts       # /pcs budget filter
│   └── pc-configurator.spec.ts  # /pcs/[slug] configurator
├── unit/
│   └── stores/                  # Zustand store tests
│       ├── filters.test.ts      # Filter store logic
│       └── config.test.ts       # Configuration store logic
├── setup.ts                     # Vitest setup
└── screenshots/                 # Playwright component screenshots
```

## E2E Test Guidelines

### Screenshot Policy

**✅ ALLOWED:**
- Component/section screenshots: `await element.screenshot()`
- Specific UI element screenshots
- Before/after comparison screenshots

**❌ FORBIDDEN:**
- Full-page screenshots: `await page.screenshot({ fullPage: true })`
- Viewport screenshots without targeting specific components

### Example: Correct Screenshot Usage

```typescript
// ✅ Good - Component screenshot
const budgetFilter = page.locator("h3", { hasText: "Бюджет" }).locator("..");
await budgetFilter.screenshot({
  path: "tests/screenshots/budget-filter.png",
});

// ❌ Bad - Full page screenshot
await page.screenshot({ fullPage: true });
```

## Unit Test Guidelines

### Testing Stores

All Zustand stores should have comprehensive unit tests:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useYourStore } from "@/stores/your-store";

describe("useYourStore", () => {
  it("should have correct initial state", () => {
    const { result } = renderHook(() => useYourStore());
    expect(result.current.someValue).toBe(expectedValue);
  });

  it("should update state correctly", () => {
    const { result } = renderHook(() => useYourStore());
    act(() => {
      result.current.updateFunction(newValue);
    });
    expect(result.current.someValue).toBe(newValue);
  });
});
```

## Performance Testing

### Bundle Analysis

```bash
# Analyze bundle composition
pnpm build:analyze
```

This opens an interactive treemap showing:
- Largest chunks
- Duplicate dependencies
- Optimization opportunities

### Bundle Size Budgets

Defined in `.bundlesize.json`:
- **JS chunks**: Max 200kb (gzipped)
- **CSS files**: Max 50kb (gzipped)

### Performance Metrics

Target metrics (measured via Lighthouse):
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **TTI**: < 3.8s
- **TBT**: < 200ms

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm playwright:install
      - run: pnpm test:e2e
      - run: pnpm build
```

## Debugging Tests

### Vitest Debugging

1. **VS Code**: Set breakpoints and use "JavaScript Debug Terminal"
2. **Browser**: Open `pnpm test:ui` for interactive debugging
3. **Console**: Add `console.log()` statements in tests

### Playwright Debugging

1. **UI Mode**: `pnpm test:e2e:ui` - Interactive test runner
2. **Debug Mode**: `pnpm test:e2e:debug` - Step through tests
3. **Trace Viewer**: Check `test-results/` for detailed traces

### Common Issues

**Vitest: "Module not found"**
- Check `vitest.config.ts` path aliases match `tsconfig.json`
- Ensure `tests/setup.ts` is properly imported

**Playwright: "Timeout waiting for element"**
- Increase timeout: `await element.waitFor({ timeout: 10000 })`
- Check element selector is correct
- Verify page is fully loaded: `await page.waitForLoadState("networkidle")`

**Performance: Bundle size exceeded**
- Run `pnpm build:analyze` to identify large dependencies
- Check for duplicate packages in different versions
- Consider dynamic imports for heavy components

## Best Practices

### E2E Tests

1. **Test real user flows**, not implementation details
2. **Use data-testid** for stable selectors when needed
3. **Wait for network idle** before assertions
4. **Take component screenshots** for visual regression
5. **Mock external APIs** to ensure test stability

### Unit Tests

1. **Test behavior**, not implementation
2. **Use descriptive test names**
3. **Group related tests** with `describe` blocks
4. **Reset state** between tests (using `beforeEach`)
5. **Aim for high coverage** on critical paths

### Performance

1. **Memoize expensive components** with `React.memo()`
2. **Use `useMemo`** for expensive calculations
3. **Use `useCallback`** for callbacks passed to memoized children
4. **Optimize images** with `next/image`
5. **Code split** heavy components with dynamic imports

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
