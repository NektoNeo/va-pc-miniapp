-- Delete existing admin user (if any)
DELETE FROM "AdminUser" WHERE email = 'test@va-pc.ru';

-- Create new admin user
INSERT INTO "AdminUser" (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'test@va-pc.ru',
  '$2b$10$Bvj2fRrbtEzA8JVeiTN2zOzWS7XjNe4MagPSLfgvAUQrg80sEGjxi',
  'Test Admin',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
)
RETURNING id, email, name, role;
