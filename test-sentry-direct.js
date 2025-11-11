// Прямая отправка ошибки в Sentry API без SDK
const https = require('https');

const DSN = 'https://157bc825c692d5ca3d5ddd7edc7abac5@o4509966327939072.ingest.de.sentry.io/4510285263929424';
const dsnMatch = DSN.match(/https:\/\/(.+)@(.+)\/(\d+)/);
const [, publicKey, host, projectId] = dsnMatch;

const event = {
  event_id: require('crypto').randomBytes(16).toString('hex'),
  timestamp: new Date().toISOString(),
  platform: 'node',
  sdk: {
    name: 'direct-test',
    version: '1.0.0'
  },
  logger: 'direct-test',
  level: 'error',
  message: 'Direct API Test Error',
  exception: {
    values: [{
      type: 'Error',
      value: 'Direct API Test Error - Bypassing SDK',
      stacktrace: {
        frames: [{
          filename: 'test-sentry-direct.js',
          function: 'testDirect',
          lineno: 10
        }]
      }
    }]
  },
  environment: 'development',
  tags: {
    test: 'direct-api',
    source: 'node-script'
  }
};

const postData = JSON.stringify(event);

const options = {
  hostname: host,
  port: 443,
  path: `/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Отправка ошибки напрямую в Sentry...');
console.log('URL:', `https://${host}/api/${projectId}/store/`);
console.log('Event ID:', event.event_id);

const req = https.request(options, (res) => {
  console.log('✅ Статус:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Ответ:', data || '(пусто)');
    if (res.statusCode === 200) {
      console.log('\n🎉 УСПЕХ! Ошибка отправлена.');
      console.log('🔗 Проверьте Issues: https://va-pc.sentry.io/issues/?project=4510285263929424');
    } else {
      console.log('\n❌ ОШИБКА! Статус:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Ошибка запроса:', e);
});

req.write(postData);
req.end();
