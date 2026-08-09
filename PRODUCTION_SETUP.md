# AI News Platform — Production Setup & Operations Guide

This guide consolidates all deployment, infrastructure, and operations requirements for running the AI News Platform in a production Linux/Docker environment.

## 1. Production Architecture Overview
The platform consists of 9 distinct Docker containers:
- **API Gateway (Spring Cloud)**
- **Auth, News, Category, Search, Scheduler, Admin Services** (Spring Boot 3.2 / Java 21)
- **Nginx** (Frontend & Reverse Proxy)
- **MySQL 8** & **Redis**

## 2. Environment Variables Guide
Before deployment, a `.env` file must be created alongside `docker-compose.yml`. 
Ensure you generate strong cryptographic keys (at least 256-bit).

```env
# Database
MYSQL_ROOT_PASSWORD=strong_root_password
MYSQL_USER=newsplatform
MYSQL_PASSWORD=strong_db_password

# Redis
REDIS_PASSWORD=strong_redis_password

# Security
JWT_SECRET=your_super_secret_jwt_signing_key_min_32_bytes
INTERNAL_API_KEY=your_internal_service_key

# Third-party APIs
NEWSAPI_KEY=your_key
```

## 3. Deployment Guide (Docker)
We use a two-file compose strategy to separate base images from production constraints.

1. **Clone the repository.**
2. **Configure `.env`** as shown above.
3. **Build the production images:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```
4. **Deploy the stack:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 4. Security & Hardening Checklist
- [x] **CORS Restricted:** The API gateway allows only production domains (`https://*.newsplatform.com`).
- [x] **Actuators Secured:** `location ~ ^/(api/)?actuator(/.*)?$` is explicitly denied in Nginx. Internal services (like Prometheus) can still scrape `/actuator/prometheus` via internal Docker DNS (`http://news-service:8082/actuator/prometheus`).
- [x] **Logback Configuration:** JSON structured logging is injected via `application-common.yml` to ensure logs are easily parsable by Logstash/Loki. Trace IDs are automatically generated.
- [x] **Redis Hardened:** `maxmemory 256mb` and `maxmemory-policy allkeys-lru` are configured to prevent host OOM.

## 5. Operations & Monitoring Guide
### Health & Metrics
- Liveness/Readiness: `/actuator/health/liveness`
- Metrics: `/actuator/prometheus`
*(Note: These are only accessible internally due to Nginx blocking rules)*

### Log Management
View container logs in standard format:
```bash
docker-compose logs -f --tail=100 news-service
```
Since the platform is configured for `logback-spring.xml` JSON layout, these logs can be natively ingested by Promtail/Loki.

## 6. API Documentation
All backend services implement OpenAPI 3. You can access the Swagger UI by port-forwarding the internal services directly during maintenance, e.g., `http://localhost:8081/swagger-ui.html`. By default, API Docs are not exposed via the Gateway to external users.
