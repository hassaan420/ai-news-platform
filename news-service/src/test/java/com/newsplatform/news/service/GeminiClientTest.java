package com.newsplatform.news.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiClientTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private GeminiRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        // leniency for tests that don't reach tryAcquire
        lenient().when(rateLimiter.tryAcquire()).thenReturn(true);
        lenient().when(rateLimiter.isOnCooldown()).thenReturn(false);
    }

    private GeminiClient createClient(String apiKeys) {
        return new GeminiClient(
                restTemplate,
                rateLimiter,
                apiKeys,
                "gemini-flash-latest",
                2,
                10,
                50
        );
    }

    private Map<String, Object> createMockResponse(String text) {
        return Map.of(
                "candidates", List.of(Map.of(
                        "content", Map.of(
                                "parts", List.of(Map.of("text", text))
                        )
                ))
        );
    }

    @Test
    @SuppressWarnings("unchecked")
    void testSingleKeySuccess() {
        GeminiClient client = createClient("key-1");
        
        when(restTemplate.exchange(
                contains("key=key-1"), 
                eq(HttpMethod.POST), 
                any(), 
                eq(Map.class))
        ).thenReturn(ResponseEntity.ok(createMockResponse("Response 1")));

        String result = client.generate("test prompt");
        assertEquals("Response 1", result);
        
        verify(restTemplate, times(1)).exchange(anyString(), any(), any(), any(Class.class));
        verify(rateLimiter, never()).recordRateLimitHit(anyLong());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testSingleKeyExhaustion() {
        GeminiClient client = createClient("key-1");
        
        when(restTemplate.exchange(
                contains("key=key-1"), 
                eq(HttpMethod.POST), 
                any(), 
                eq(Map.class))
        ).thenThrow(HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", null, 
                "{\"error\":{\"details\":[{\"retryDelay\":\"10s\"}]}}".getBytes(), null));

        String result = client.generate("test prompt");
        assertNull(result);
        
        verify(restTemplate, times(1)).exchange(anyString(), any(), any(), any(Class.class));
        // Should hit global rate limiter immediately since only 1 key is configured
        // Record rate limit hit should be called with -1L because when it exhausts all keys, it defaults to -1L
        verify(rateLimiter, times(1)).recordRateLimitHit(-1L);
    }

    @Test
    @SuppressWarnings("unchecked")
    void testMultiKeyRotation() {
        GeminiClient client = createClient("key-1, key-2");
        
        // Key 1 fails with 429
        when(restTemplate.exchange(
                contains("key=key-1"), 
                eq(HttpMethod.POST), 
                any(), 
                eq(Map.class))
        ).thenThrow(HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", null, 
                "{\"error\":{\"details\":[{\"retryDelay\":\"10s\"}]}}".getBytes(), null));

        // Key 2 succeeds
        when(restTemplate.exchange(
                contains("key=key-2"), 
                eq(HttpMethod.POST), 
                any(), 
                eq(Map.class))
        ).thenReturn(ResponseEntity.ok(createMockResponse("Response 2")));

        String result = client.generate("test prompt");
        assertEquals("Response 2", result);
        
        // Exchange was called twice
        verify(restTemplate, times(2)).exchange(anyString(), any(), any(), any(Class.class));
        // Should NOT hit global rate limiter, because key-2 succeeded
        verify(rateLimiter, never()).recordRateLimitHit(anyLong());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testMultiKeyExhaustion() {
        GeminiClient client = createClient("key-1, key-2");
        
        // Both keys fail with 429
        when(restTemplate.exchange(
                anyString(), 
                eq(HttpMethod.POST), 
                any(), 
                eq(Map.class))
        ).thenThrow(HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", null, 
                "{\"error\":{\"details\":[{\"retryDelay\":\"5s\"}]}}".getBytes(), null));

        String result = client.generate("test prompt");
        assertNull(result);
        
        // Called twice (once for each key)
        verify(restTemplate, times(2)).exchange(anyString(), any(), any(), any(Class.class));
        // Once both are in cooldown, global rate limiter activates
        verify(rateLimiter, times(1)).recordRateLimitHit(-1L);
    }
}
