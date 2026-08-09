package com.newsplatform.gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

class RequestLoggingFilterTest {

  private RequestLoggingFilter filter;
  private GatewayFilterChain chain;

  @BeforeEach
  void setUp() {
    filter = new RequestLoggingFilter();
    chain = mock(GatewayFilterChain.class);
    when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
  }

  @Test
  void shouldGenerateCorrelationIdWhenMissing() {
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/news/latest").build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);

    filter.filter(exchange, chain).block();

    String correlationId = exchange.getResponse().getHeaders().getFirst(RequestLoggingFilter.CORRELATION_ID_HEADER);
    assertNotNull(correlationId, "Correlation ID header should be attached to response");
  }

  @Test
  void shouldPreserveExistingCorrelationId() {
    String existingId = "custom-correlation-12345";
    MockServerHttpRequest request = MockServerHttpRequest.get("/api/news/latest")
        .header(RequestLoggingFilter.CORRELATION_ID_HEADER, existingId)
        .build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);

    filter.filter(exchange, chain).block();

    String correlationId = exchange.getResponse().getHeaders().getFirst(RequestLoggingFilter.CORRELATION_ID_HEADER);
    assertEquals(existingId, correlationId, "Existing correlation ID should be preserved");
  }
}
