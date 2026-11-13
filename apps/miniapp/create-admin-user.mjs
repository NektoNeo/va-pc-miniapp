import pg from 'pg';
import bcrypt from 'bcryptjs';

const { DATABASE_URL, ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_BOOTSTRAP_EMAIL || !ADMIN_BOOTSTRAP_PASSWORD ||
    ADMIN_BOOTSTRAP_PASSWORD.length < 16 || Buffer.byteLength(ADMIN_BOOTSTRAP_PASSWORD) > 72) {
  throw new Error('Set DATABASE_URL, ADMIN_BOOTSTRAP_EMAIL and a password of at least 16 characters (maximum 72 bytes).');
}

const client = new pg.Client({ connectionString: DATABASE_URL });
try {
  const passwordHash = await bcrypt.hash(ADMIN_BOOTSTRAP_PASSWORD, 12);
  await client.connect();
  const result = await client.query(
    `INSERT INTO "AdminUser" (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, 'Administrator', 'SUPER_ADMIN', true, NOW(), NOW())
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_BOOTSTRAP_EMAIL, passwordHash],
  );
  console.log(result.rowCount ? 'Administrator created.' : 'Account already exists.');
} finally {
  await client.end();
}
