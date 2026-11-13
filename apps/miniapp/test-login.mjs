if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD for the test account');
const response = await fetch('http://localhost:3000/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: process.env.ADMIN_BOOTSTRAP_EMAIL || 'test@va-pc.ru',
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD
  })
});

console.log('Status:', response.status);
if (!response.ok) process.exitCode = 1;
