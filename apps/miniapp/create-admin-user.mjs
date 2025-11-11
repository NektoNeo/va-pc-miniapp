import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

// Database connection from .env.local
const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/vapc_dev';

async function createAdminUser() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Hash password
    const password = 'TestPassword123!';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Delete existing admin user if exists
    await client.query('DELETE FROM "AdminUser" WHERE email = $1', ['test@va-pc.ru']);
    console.log('🗑️  Deleted existing admin user (if any)');

    // Create new admin user
    const result = await client.query(
      `INSERT INTO "AdminUser" (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, name, role`,
      ['test@va-pc.ru', passwordHash, 'Test Admin', 'SUPER_ADMIN', true]
    );

    console.log('✅ Admin user created:');
    console.log(result.rows[0]);
    console.log('\n📧 Email: test@va-pc.ru');
    console.log('🔑 Password: TestPassword123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createAdminUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
