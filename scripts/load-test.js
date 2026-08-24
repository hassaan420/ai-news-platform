import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
  },
};

const BASE_URL = 'http://localhost/api';

export default function () {
  // 1. Homepage (Latest)
  const latestRes = http.get(`${BASE_URL}/news/latest?size=10`);
  check(latestRes, {
    'latest status is 200': (r) => r.status === 200,
  });

  // 2. Trending
  const trendingRes = http.get(`${BASE_URL}/news/trending?size=5`);
  check(trendingRes, {
    'trending status is 200': (r) => r.status === 200,
  });

  // 3. Search
  const searchRes = http.get(`${BASE_URL}/search?keyword=AI&size=10`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });

  // Pause between iterations
  sleep(1);
}
