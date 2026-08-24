# Docker Optimization Audit

## 1. Redundant Maven Compilation
- **Problem**: Each microservice Dockerfile performed a separate `mvn clean package` on the reactor, causing `common-library` and all dependencies to be downloaded and built 7 times simultaneously. This led to massive CPU and RAM spikes.
- **Affected File**: All service `Dockerfile`s
- **Why it causes resource spikes**: N concurrent Maven reactor builds on an 8 GB laptop exhaust CPU scheduling and memory limits, often leading to Docker Engine freezes or OutOfMemory exceptions.
- **Severity**: Critical
- **Proposed Fix**: Create a single multi-stage root `Dockerfile` using BuildKit `--mount=type=cache,target=/root/.m2` that builds the entire project in one stage, and then copies the JARs out to individual service images.
- **Expected Benefit**: 80% reduction in build time and elimination of concurrent compilation CPU/RAM spikes.
- **Functionality Changes**: None.

## 2. Spring Config Import Failure (application-common.yml)
- **Problem**: `spring.config.import=classpath:application-common.yml` failed because `common-library` was being repackaged into a Spring Boot executable JAR by the Maven plugin instead of remaining a standard Java library. This hid the properties file inside `BOOT-INF/classes`.
- **Affected File**: `common-library/pom.xml`, `application-common.yml`
- **Why it causes issues**: Prevents dependent services from starting or loading the common database/cache configuration correctly.
- **Severity**: Critical
- **Proposed Fix**: Exclude `common-library` from the `spring-boot-maven-plugin` repackaging execution by adding `<skip>true</skip>`.
- **Expected Benefit**: Services correctly load centralized configuration.
- **Functionality Changes**: None.

## 3. JVM Memory Limits Too High
- **Problem**: Microservices lacked restricted JVM memory configurations in development mode, allowing the JVM to consume large amounts of memory by default.
- **Affected File**: `docker-compose.override.yml`
- **Why it causes resource spikes**: Default MaxRAMPercentage or implicit max heap on 8 GB leads to out-of-memory errors when 7 Java applications try to start simultaneously.
- **Severity**: High
- **Proposed Fix**: Implement `-Xmx128m -Xms64m` for lightweight services (gateway, auth, search, category, scheduler, admin) and `-Xmx384m` for heavy services (news).
- **Expected Benefit**: Predictable memory footprint under 3-4 GB for the entire backend.
- **Functionality Changes**: None.

## 4. Docker Compose Healthchecks Overly Aggressive
- **Problem**: `start_period: 300s` with strict `service_healthy` dependencies meant Docker Compose would wait extremely long for services that might just need 30 seconds. Gateway dependencies caused cascading delays.
- **Affected File**: `docker-compose.yml`
- **Why it causes issues**: High idle wait times and complex container dependency deadlocks.
- **Severity**: Medium
- **Proposed Fix**: Decrease `start_period` to 60s, change interval to 30s. Remove `service_healthy` strict requirements from `gateway-service` for downstream apps to allow faster partial starts.
- **Expected Benefit**: Much faster full-stack boot time.
- **Functionality Changes**: Gateway might route to a 502 Bad Gateway for a few seconds during startup, which is normal distributed system behavior.

## 5. Aggressive Background Scheduling
- **Problem**: `scheduler-service` constantly triggered AI processing and API calls during local frontend demonstrations.
- **Affected File**: `scheduler-service/src/main/resources/application.yml`
- **Why it causes issues**: Unnecessary CPU usage when simply presenting the UI or testing other components.
- **Severity**: Low
- **Proposed Fix**: Add `@ConditionalOnProperty(name="SCHEDULER_ENABLED")` and default it to `false` in `dev` mode.
- **Expected Benefit**: Zero background CPU idle usage.
- **Functionality Changes**: Scheduler is disabled by default in demo mode, but can be enabled easily.

## 6. Deprecated APIs
- **Problem**: `RestTemplateBuilder.setConnectTimeout` and `@MockBean` were deprecated in Spring Boot 3.4.
- **Affected File**: Service classes and tests.
- **Severity**: Low
- **Proposed Fix**: Migrate to `ClientHttpRequestFactorySettings` and `@MockitoBean`.
- **Expected Benefit**: Clean build with no warnings.
- **Functionality Changes**: None.
