# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY common-library/pom.xml common-library/pom.xml
COPY gateway-service/pom.xml gateway-service/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY news-service/pom.xml news-service/pom.xml
COPY category-service/pom.xml category-service/pom.xml
COPY search-service/pom.xml search-service/pom.xml
COPY scheduler-service/pom.xml scheduler-service/pom.xml
COPY admin-service/pom.xml admin-service/pom.xml
RUN mvn dependency:go-offline -B
COPY . .
RUN mvn -pl admin-service -am clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

LABEL org.opencontainers.image.title="ai-news-platform" \
      org.opencontainers.image.description="Admin Service — source/category/user management, cache control, health aggregation" \
      org.opencontainers.image.source="https://github.com/ai-news-platform/admin-service" \
      org.opencontainers.image.vendor="AI News Platform"

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /workspace/admin-service/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser

ENV JAVA_OPTS=""
EXPOSE 8086
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
