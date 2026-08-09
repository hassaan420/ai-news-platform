package com.newsplatform.gateway.filter;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global reactive filter for API Gateway request logging and correlation tracking.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Generates a unique {@code X-Correlation-Id} if missing from incoming request.</li>
 *   <li>Injects {@code X-Correlation-Id} into the request header sent to downstream services.</li>
 *   <li>Attaches {@code X-Correlation-Id} to the HTTP response header.</li>
 *   <li>Logs request method, path, HTTP status, and duration (ms) statelessly.</li>
 * </ul>
 */
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

  private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
  public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();

    String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
    if (correlationId == null || correlationId.isBlank()) {
      correlationId = UUID.randomUUID().toString();
    }

    ServerHttpRequest mutatedRequest = request.mutate()
        .header(CORRELATION_ID_HEADER, correlationId)
        .build();

    ServerWebExchange mutatedExchange = exchange.mutate()
        .request(mutatedRequest)
        .build();

    mutatedExchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, correlationId);

    long startTime = System.currentTimeMillis();
    String method = mutatedRequest.getMethod() != null ? mutatedRequest.getMethod().name() : "UNKNOWN";
    String path = mutatedRequest.getURI().getPath();

    log.info("[CorrelationID: {}] Incoming request: {} {}", correlationId, method, path);

    final String activeCorrelationId = correlationId;
    return chain.filter(mutatedExchange).then(Mono.fromRunnable(() -> {
      long duration = System.currentTimeMillis() - startTime;
      int statusCode = mutatedExchange.getResponse().getStatusCode() != null
          ? mutatedExchange.getResponse().getStatusCode().value()
          : 500;
      log.info("[CorrelationID: {}] Response: {} {} -> Status: {} ({} ms)",
          activeCorrelationId, method, path, statusCode, duration);
    }));
  }

  @Override
  public int getOrder() {
    return HIGHEST_PRECEDENCE;
  }
}
