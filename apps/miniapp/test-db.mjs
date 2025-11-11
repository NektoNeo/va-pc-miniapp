import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/vapc_dev'
});

try {
  console.log('Connecting to database...');
  await client.connect();
  console.log('✅ Connected!');

  const res = await client.query('SELECT NOW()');
  console.log('✅ Query works:', res.rows[0]);

  await client.end();
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
}
