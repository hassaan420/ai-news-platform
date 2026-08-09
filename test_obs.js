const axios = require('axios');

async function checkObs() {
  const services = [
    { name: 'Prometheus', url: 'http://localhost:9090/-/healthy' },
    { name: 'Grafana', url: 'http://localhost:3001/api/health' },
    { name: 'Alertmanager', url: 'http://localhost:9093/-/healthy' },
    { name: 'Loki', url: 'http://localhost:3100/ready' },
    { name: 'Zipkin', url: 'http://localhost:9411/health' }
  ];

  for (const svc of services) {
    try {
      const res = await axios.get(svc.url, { timeout: 5000 });
      console.log(`[OK] ${svc.name} - Status: ${res.status}`);
    } catch (e) {
      console.error(`[FAIL] ${svc.name} - Error: ${e.message}`);
    }
  }
}

checkObs();
