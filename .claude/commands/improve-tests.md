Analyze the codebase and recommend areas to improve test coverage.

Focus areas:
1. **API Routes** - Test all endpoints in `/app/api/`
   - Admin endpoints authentication
   - FPS metrics CRUD operations
   - PC builds endpoints
   - Error handling

2. **Components** - Add tests for critical components
   - FPSMetricsDisplay
   - FpsMetricsManager
   - Admin tables and forms
   - Mini App navigation

3. **Utilities & Validation**
   - Zod schemas validation
   - game-icons mapping
   - Auth helpers

4. **Integration Tests**
   - E2E flows for admin panel
   - Mini App user journeys
   - Database operations

Provide specific file recommendations with test examples using Vitest/Jest and React Testing Library.
