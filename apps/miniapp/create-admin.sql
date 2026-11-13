-- Run using psql. Supply ADMIN_BOOTSTRAP_EMAIL and a bcrypt ADMIN_BOOTSTRAP_HASH
-- to the psql process through the environment. Existing accounts are preserved.
\set ON_ERROR_STOP on
\getenv bootstrap_email ADMIN_BOOTSTRAP_EMAIL
\getenv bootstrap_hash ADMIN_BOOTSTRAP_HASH
INSERT INTO "AdminUser" (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")
SELECT gen_random_uuid(), :'bootstrap_email', :'bootstrap_hash', 'Administrator', 'SUPER_ADMIN', true, NOW(), NOW()
WHERE length(trim(:'bootstrap_email')) > 0 AND :'bootstrap_hash' ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'
ON CONFLICT (email) DO NOTHING;
