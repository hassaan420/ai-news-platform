# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
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
RUN mvn -pl gateway-service -am clean package -DskipTests -B --no-transfer-progress

# ─── Stage 2: Runtime (Hardened) ──────────────────────────────
FROM eclipse-temurin:21-jre-alpine
LABEL org.opencontainers.image.title="ai-news-platform" \
      org.opencontainers.image.description="API Gateway — routing, JWT verification, rate limiting" \
      org.opencontainers.image.source="https://github.com/ai-news-platform/gateway-service" \
      org.opencontainers.image.vendor="AI News Platform" \
      org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache wget tini && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=build /workspace/gateway-service/target/*.jar app.jar
RUN chown appuser:appgroup app.jar && chmod 400 app.jar && \
    mkdir -p /tmp/app && chown appuser:appgroup /tmp/app

USER appuser
EXPOSE 8080

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
