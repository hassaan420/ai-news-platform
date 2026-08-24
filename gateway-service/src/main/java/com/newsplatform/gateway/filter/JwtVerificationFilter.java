package com.newsplatform.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtVerificationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret:default-secret-key-for-development-only-change-me-in-production}")
    private String jwtSecret;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final List<String> publicEndpoints = List.of(
            "/api/auth/**",
            "/api/categories/**",
            "/api/weather/**",
            "/api/news/**",
            "/api/articles/**",
            "/actuator/**"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        boolean isPublic = publicEndpoints.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
        
        // Some endpoints like POST /api/categories are admin only, but GET is public.
        // If it's a GET to /api/categories or /api/news or /api/articles, it's public.
        if (isPublic) {
            if (!method.equals("GET") && !path.startsWith("/api/auth/") && !path.startsWith("/actuator/")) {
                isPublic = false; // Need auth for POST/PUT/DELETE
            }
        }

        if (isPublic) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String role = claims.get("role", String.class);
            String userId = claims.getSubject();

            // Admin only paths
            if (path.startsWith("/api/admin/") && !"ROLE_ADMIN".equals(role)) {
                return onError(exchange, "Insufficient permissions", HttpStatus.FORBIDDEN);
            }

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role)
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (JwtException | IllegalArgumentException e) {
            return onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // We could also write JSON, but standard empty body with status is fine for now
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
