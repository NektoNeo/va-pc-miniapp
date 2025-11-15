Perform TypeScript type checking and improvements.

Tasks:

## 1. Type Safety Audit
- Find `any` types and replace with proper types
- Check for implicit any
- Review type assertions (as Type)
- Find missing return types

## 2. Prisma Types
- Ensure generated types are used correctly
- Check for type mismatches in queries
- Review include/select types

## 3. React Component Props
- Verify all props have proper types
- Check for missing prop types
- Review generic component types

## 4. API Response Types
- Ensure API responses match TypeScript types
- Check fetch/query typing
- Review error response types

## 5. Strict Mode Compliance
- Check if strict mode is enabled
- Fix strict null checks
- Review strictPropertyInitialization

Run `tsc --noEmit` and fix all type errors.
Provide suggestions for improving type safety.
