Generate and review Prisma database migration.

Task: $ARGUMENTS

Steps:

## 1. Schema Update
- Update `schema.prisma` with requested changes
- Follow naming conventions
- Add proper relations
- Include indexes where needed

## 2. Migration Generation
```bash
npx prisma migrate dev --name "$ARGUMENTS"
```

## 3. Review Migration SQL
- Check for data loss risks
- Review index creation
- Verify constraints
- Check for breaking changes

## 4. Data Migration Script (if needed)
- Write data migration script
- Test on development database
- Provide rollback strategy

## 5. Update TypeScript Types
- Regenerate Prisma Client
- Update affected API routes
- Fix type errors

Provide migration details and any warnings/considerations.
