Perform a comprehensive security audit of the codebase.

Check for:

## 1. Authentication & Authorization
- JWT session validation
- Admin role checks
- Middleware bypass vulnerabilities
- Session expiration handling

## 2. Input Validation
- SQL injection prevention (Prisma queries)
- XSS protection in React components
- CSRF protection
- File upload validation (if any)

## 3. API Security
- Rate limiting
- CORS configuration
- Sensitive data exposure
- Error messages (no stack traces in prod)

## 4. Telegram Mini App Security
- WebApp data validation
- User ID verification
- Bot token protection

## 5. Dependencies
- Outdated packages with vulnerabilities
- Unused dependencies

## 6. Environment Variables
- Secrets not hardcoded
- .env.local properly gitignored
- Production vs development configs

Provide actionable recommendations with code examples.
