Setup environment configuration for different environments.

Create/update environment files:

## 1. Development (.env.local)
```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vapc_dev
JWT_SECRET=your_dev_secret_min_32_chars
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_dev_bot
```

## 2. Production (.env.production)
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=your_production_secret
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_prod_bot
```

## 3. Testing (.env.test)
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vapc_test
JWT_SECRET=test_secret_for_e2e_testing_minimum_32_characters_long
```

## 4. Environment Variables Documentation
Create `.env.example` with all required variables and descriptions.

## 5. Validation
- Add runtime env validation (zod/envalid)
- Check for missing required vars
- Validate format/types

Provide setup instructions and validation script.
