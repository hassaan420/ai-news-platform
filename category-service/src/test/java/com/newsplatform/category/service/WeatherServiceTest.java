package com.newsplatform.category.service;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import com.newsplatform.category.dto.WeatherResponseDto;
import com.newsplatform.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@WireMockTest(httpPort = 8089)
public class WeatherServiceTest {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private CacheManager cacheManager;

    private static final String MOCK_API_KEY = "test-secret-key-123";

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("weather.api-key", () -> MOCK_API_KEY);
    }

    @BeforeEach
    void setUp() {
        if (cacheManager.getCache("weather_current") != null) {
            cacheManager.getCache("weather_current").clear();
        }
        WireMock.reset();
    }

    @Test
    void testGetCurrentWeather_City_HappyPathAndCacheHit() {
        String mockJsonResponse = """
            {
              "name": "London",
              "main": {
                "temp": 15.5,
                "humidity": 82
              },
              "weather": [
                {
                  "main": "Clouds",
                  "description": "overcast clouds",
                  "icon": "04d"
                }
              ],
              "wind": {
                "speed": 4.12
              }
            }
            """;

        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .withQueryParam("q", equalTo("London"))
                .withQueryParam("appid", equalTo(MOCK_API_KEY))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(mockJsonResponse)));

        WeatherResponseDto response1 = weatherService.getCurrentWeatherByCity("London");
        assertEquals("London", response1.city());
        assertEquals(15.5, response1.temperatureCelsius());
        assertEquals("Clouds", response1.condition());
        assertEquals(14.8, response1.windSpeedKph());

        WeatherResponseDto response2 = weatherService.getCurrentWeatherByCity("london "); // test trimming and lowercasing in cache key
        assertEquals("London", response2.city());

        verify(1, getRequestedFor(urlPathEqualTo("/data/2.5/weather")));
    }

    @Test
    void testGetCurrentWeather_Coords_HappyPathAndCacheHit() {
        String mockJsonResponse = """
            {
              "name": "London",
              "main": { "temp": 15.5, "humidity": 82 },
              "weather": [ { "main": "Clouds", "description": "overcast clouds", "icon": "04d" } ],
              "wind": { "speed": 4.12 }
            }
            """;

        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .withQueryParam("lat", equalTo("51.51"))
                .withQueryParam("lon", equalTo("-0.13"))
                .withQueryParam("appid", equalTo(MOCK_API_KEY))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(mockJsonResponse)));

        WeatherResponseDto response1 = weatherService.getCurrentWeatherByCoordinates(51.51, -0.13);
        assertEquals("London", response1.city());

        // Call again to verify cache hit
        WeatherResponseDto response2 = weatherService.getCurrentWeatherByCoordinates(51.51, -0.13);
        assertEquals("London", response2.city());

        verify(1, getRequestedFor(urlPathEqualTo("/data/2.5/weather")));
    }

    @Test
    void testGetCurrentWeather_NotFound() {
        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .willReturn(aResponse().withStatus(404)));

        assertThrows(ResourceNotFoundException.class, () -> weatherService.getCurrentWeatherByCity("UnknownCity"));
    }

    @Test
    void testGetCurrentWeather_RateLimited() {
        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .willReturn(aResponse().withStatus(429)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> weatherService.getCurrentWeatherByCity("London"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
    }

    @Test
    void testGetCurrentWeather_ServerDown() {
        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .willReturn(aResponse().withStatus(500)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> weatherService.getCurrentWeatherByCity("London"));
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
    }

    @Test
    void testGetCurrentWeather_MalformedResponse() {
        stubFor(get(urlPathEqualTo("/data/2.5/weather"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{}")));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> weatherService.getCurrentWeatherByCity("London"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
    }
}
