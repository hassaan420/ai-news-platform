# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Cache dependency resolution layer separately for faster rebuilds
COPY pom.xml .
COPY common-library/pom.xml   common-library/pom.xml
COPY gateway-service/pom.xml  gateway-service/pom.xml
COPY auth-service/pom.xml     auth-service/pom.xml
COPY news-service/pom.xml     news-service/pom.xml
COPY category-service/pom.xml category-service/pom.xml
COPY search-service/pom.xml   search-service/pom.xml
COPY scheduler-service/pom.xml scheduler-service/pom.xml
COPY admin-service/pom.xml    admin-service/pom.xml
RUN mvn dependency:go-offline -B --no-transfer-progress

COPY . .
RUN mvn -pl auth-service -am clean package -DskipTests -B --no-transfer-progress

# ─── Stage 2: Runtime (Hardened) ──────────────────────────────
# Use distroless or minimal Alpine JRE — no shell = smaller attack surface
FROM eclipse-temurin:21-jre-alpine

LABEL org.opencontainers.image.title="ai-news-platform" \
      org.opencontainers.image.description="Auth Service — JWT issuance, registration, login, token refresh" \
      org.opencontainers.image.source="https://github.com/ai-news-platform/auth-service" \
      org.opencontainers.image.vendor="AI News Platform" \
      org.opencontainers.image.version="1.0.0"

# Install only what is strictly needed for health checks
RUN apk add --no-cache wget tini && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy artifact from build stage
COPY --from=build /workspace/auth-service/target/*.jar app.jar

# Secure file ownership — read-only by non-root user
RUN chown appuser:appgroup app.jar && chmod 400 app.jar

# Create writable tmp dir for JVM (needed even with read-only FS)
RUN mkdir -p /tmp/app && chown appuser:appgroup /tmp/app

USER appuser

EXPOSE 8081

# SECURITY: Use exec form (no shell) + tini for proper signal handling + PID 1
# JVM flags: G1GC, container-aware memory, crash on OOM, GC logging
ENTRYPOINT ["tini", "--"]
CMD ["java", \
     "-XX:+UseContainerSupport", \
     "-XX:MaxRAMPercentage=75.0", \
     "-XX:InitialRAMPercentage=50.0", \
     "-XX:+UseG1GC", \
     "-XX:MaxGCPauseMillis=200", \
     "-XX:+ExitOnOutOfMemoryError", \
     "-Djava.security.egd=file:/dev/./urandom", \
     "-Dspring.jmx.enabled=false", \
     "-jar", "app.jar"]
