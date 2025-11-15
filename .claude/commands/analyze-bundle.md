Analyze and optimize Next.js bundle size.

Steps:

## 1. Bundle Analysis
- Run bundle analyzer
- Identify large dependencies
- Find duplicate packages
- Check for unused code

## 2. Optimization Opportunities
- Review dynamic imports usage
- Check for code splitting
- Find opportunities for lazy loading
- Review third-party libraries size

## 3. Mini App Specific
- Optimize for Telegram WebApp
- Check initial load size
- Review critical CSS
- Analyze hydration performance

## 4. Recommendations
- Suggest bundle size improvements
- Recommend tree-shaking opportunities
- Propose package alternatives (lighter versions)
- Review next.config.js optimizations

Commands to run:
```bash
npm run build
npx @next/bundle-analyzer
```

Provide actionable optimization suggestions with expected size reductions.
