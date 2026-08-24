# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
# Copy POMs for dependency resolution cache
COPY pom.xml .
COPY common-library/pom.xml common-library/
COPY gateway-service/pom.xml gateway-service/
COPY auth-service/pom.xml auth-service/
COPY news-service/pom.xml news-service/
COPY category-service/pom.xml category-service/
COPY search-service/pom.xml search-service/
COPY scheduler-service/pom.xml scheduler-service/
COPY admin-service/pom.xml admin-service/

# Cache local m2 repo. This reduces download time significantly.
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B --no-transfer-progress

# Copy source and build
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B --no-transfer-progress

# ─── Stage 2: Base Runtime (Hardened) ─────────────────────────
FROM eclipse-temurin:21-jre-alpine AS base-runtime
RUN apk add --no-cache wget tini && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app
RUN mkdir -p /tmp/app && chown appuser:appgroup /tmp/app
USER appuser

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

# ─── Service Targets ──────────────────────────────────────────

FROM base-runtime AS gateway-service
LABEL org.opencontainers.image.title="gateway-service"
COPY --from=build --chown=appuser:appgroup /workspace/gateway-service/target/*.jar app.jar
EXPOSE 8080

FROM base-runtime AS auth-service
LABEL org.opencontainers.image.title="auth-service"
COPY --from=build --chown=appuser:appgroup /workspace/auth-service/target/*.jar app.jar
EXPOSE 8081

FROM base-runtime AS news-service
LABEL org.opencontainers.image.title="news-service"
COPY --from=build --chown=appuser:appgroup /workspace/news-service/target/*.jar app.jar
EXPOSE 8082

FROM base-runtime AS category-service
LABEL org.opencontainers.image.title="category-service"
COPY --from=build --chown=appuser:appgroup /workspace/category-service/target/*.jar app.jar
EXPOSE 8083

FROM base-runtime AS search-service
LABEL org.opencontainers.image.title="search-service"
COPY --from=build --chown=appuser:appgroup /workspace/search-service/target/*.jar app.jar
EXPOSE 8084

FROM base-runtime AS scheduler-service
LABEL org.opencontainers.image.title="scheduler-service"
COPY --from=build --chown=appuser:appgroup /workspace/scheduler-service/target/*.jar app.jar
EXPOSE 8085

FROM base-runtime AS admin-service
LABEL org.opencontainers.image.title="admin-service"
COPY --from=build --chown=appuser:appgroup /workspace/admin-service/target/*.jar app.jar
EXPOSE 8086
