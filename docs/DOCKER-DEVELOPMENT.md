# AI News Platform - Docker Development Guide

This guide explains how to build and run the AI News Platform locally on machines with limited RAM (e.g., 8 GB).

## Optimized Architecture

The project has been optimized to compile using a single **multi-stage root Dockerfile**. 
This eliminates redundant Maven compilation, drastically reducing CPU/RAM usage during build times. 
Additionally, JVM memory limits are constrained in `docker-compose.override.yml`.

---

## 1. Build the Platform

To build the entire microservice architecture efficiently (using Docker BuildKit):

```bash
docker compose build
```

*Note: Since all services share the same root Dockerfile, the Maven reactor build executes only once and its output is shared across all containers.*

---

## 2. Startup Modes (Profiles)

We use Docker Compose profiles to start only the services you need. 

### MODE 1: Minimal Backend (Core functionality only)
Starts MySQL, Redis, Auth Service, News Service, and Gateway.
```bash
docker compose up -d
```
*(By default, services without a profile or in the default profile will start).*

### MODE 2: Demo Mode (Frontend + Core Backend)
Starts everything in Minimal, plus Category Service, Search Service, Frontend, and Nginx.
```bash
docker compose --profile demo up -d
```

### MODE 3: Full Architecture
Starts the complete stack including Admin Service, Scheduler Service, and Zipkin.
```bash
docker compose --profile full up -d
```

---

## 3. Useful Commands

**Stop the system safely without destroying data:**
```bash
docker compose down
```

**Check memory and CPU usage of containers:**
```bash
docker stats
```

**Check logs for a specific service:**
```bash
docker compose logs -f gateway-service
```

---

## 4. Resource Configuration

- **JVM Limits**: Memory is capped via `JAVA_OPTS` in `docker-compose.override.yml`. Light services are limited to `-Xmx128m -Xms64m`. The heavier `news-service` is capped at `-Xmx384m`.
- **Scheduler**: The background scheduler is disabled by default in dev mode (`SCHEDULER_ENABLED=false`) to prevent unnecessary CPU usage during local UI demonstrations.
- **AI Workers**: Gemini concurrency is restricted to 1 thread locally (`AI_PROCESSING_WORKER_COUNT=1`) to protect API quotas.
