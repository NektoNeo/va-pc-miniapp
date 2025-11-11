# Load Testing с k6

Load тесты для проверки производительности API под нагрузкой.

## Установка k6

### macOS
```bash
brew install k6
```

### Windows
```bash
choco install k6
```

### Linux
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Или через Docker:
```bash
docker pull grafana/k6
```

## Запуск тестов

### 1. Запустить приложение локально
```bash
pnpm dev
```

### 2. Запустить load test
```bash
# Локальное окружение
k6 run -e BASE_URL=http://localhost:3000 tests/load/pcs.k6.js

# Production
k6 run -e BASE_URL=https://your-domain.com tests/load/pcs.k6.js

# С Docker
docker run --rm -i grafana/k6 run -e BASE_URL=http://host.docker.internal:3000 - < tests/load/pcs.k6.js
```

## Тестовые сценарии

### pcs.k6.js - API /pcs с фильтрацией
**Параметры:**
- 20 виртуальных пользователей (VUs)
- 2 минуты нагрузки
- 1 секунда между запросами

**Проверяет:**
- Производительность API под нагрузкой
- Время ответа endpoint с фильтрацией по цене
- Стабильность при 20 одновременных пользователях

**Ожидаемые метрики:**
- `http_req_duration` (p95) < 500ms
- `http_req_failed` < 1%
- `http_reqs` ~1200 requests/2min

## Результаты теста

k6 выведет метрики в консоль:
```
     data_received..................: 156 kB  1.3 kB/s
     data_sent......................: 24 kB   200 B/s
     http_req_blocked...............: avg=1.2ms    min=1µs      med=3µs      max=245ms    p(90)=5µs      p(95)=7µs
     http_req_connecting............: avg=450µs    min=0s       med=0s       max=89ms     p(90)=0s       p(95)=0s
     http_req_duration..............: avg=85.5ms   min=12.4ms   med=65.2ms   max=458ms    p(90)=145ms    p(95)=187ms
     http_req_failed................: 0.00%   ✓ 0        ✗ 1200
     http_req_receiving.............: avg=125µs    min=25µs     med=98µs     max=1.2ms    p(90)=185µs    p(95)=225µs
     http_req_sending...............: avg=35µs     min=8µs      med=28µs     max=450µs    p(90)=55µs     p(95)=75µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=85.3ms   min=12.2ms   med=65ms     max=457ms    p(90)=144ms    p(95)=186ms
     http_reqs......................: 1200    10/s
     iteration_duration.............: avg=1.08s    min=1.01s    med=1.06s    max=1.45s    p(90)=1.14s    p(95)=1.18s
     iterations.....................: 1200    10/s
     vus............................: 20      min=20     max=20
     vus_max........................: 20      min=20     max=20
```

## Настройка нагрузки

Можно изменить параметры теста:

### Увеличить VUs (виртуальных пользователей)
```javascript
export const options = {
  vus: 50, // Было 20
  duration: '2m',
};
```

### Увеличить продолжительность
```javascript
export const options = {
  vus: 20,
  duration: '5m', // Было 2m
};
```

### Ступенчатая нагрузка (ramp-up)
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Разгон до 10 VUs
    { duration: '1m', target: 20 },   // Удержание 20 VUs
    { duration: '30s', target: 0 },   // Плавное снижение
  ],
};
```

### Spike testing (всплеск нагрузки)
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Начало
    { duration: '5s', target: 100 },  // Резкий всплеск
    { duration: '30s', target: 100 }, // Удержание
    { duration: '10s', target: 0 },   // Завершение
  ],
};
```

## Пороговые значения (Thresholds)

Добавьте автоматические проверки качества:

```javascript
export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% запросов < 500ms
    http_req_failed: ['rate<0.01'],        // Ошибок < 1%
    http_reqs: ['rate>5'],                 // > 5 RPS
  },
};
```

## Cloud тестирование

Запустить в k6 Cloud:
```bash
k6 cloud tests/load/pcs.k6.js
```

## Интеграция в CI/CD

Добавить в GitHub Actions:
```yaml
- name: Run load tests
  run: |
    k6 run -e BASE_URL=${{ secrets.STAGING_URL }} \
      --out json=results.json \
      tests/load/pcs.k6.js
```

## Troubleshooting

### Ошибка "connection refused"
- Проверьте, что приложение запущено
- Проверьте BASE_URL

### Слишком высокий http_req_duration
- Проверьте производительность БД
- Проверьте индексы
- Проверьте N+1 queries

### Ошибки 429 (Too Many Requests)
- Настройте rate limiting в приложении
- Уменьшите VUs или добавьте sleep
