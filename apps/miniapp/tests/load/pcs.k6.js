import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '2m',
};

export default function () {
  http.get(`${__ENV.BASE_URL}/api/pcs?priceRange=150-225`);
  sleep(1);
}
