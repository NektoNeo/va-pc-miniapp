const response = await fetch('http://localhost:3000/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@va-pc.ru',
    password: 'TestPassword123!'
  })
});

console.log('Status:', response.status);
const data = await response.text();
console.log('Response:', data);
