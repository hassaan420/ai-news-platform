package com.newsplatform.category.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.category.dto.WeatherResponseDto;
import com.newsplatform.common.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final String OWM_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public WeatherService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${weather.api-key:${OPENWEATHERMAP_API_KEY:}}") String apiKey) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @PostConstruct
    public void init() {
        if (!StringUtils.hasText(apiKey)) {
            log.error("[WeatherService] OPENWEATHERMAP_API_KEY is not configured! Weather proxy will fail.");
            throw new IllegalStateException("OPENWEATHERMAP_API_KEY is required but not configured");
        }
    }

    @Cacheable(value = "weather_current", key = "#p0.toLowerCase().trim()", unless = "#result == null")
    public WeatherResponseDto getCurrentWeatherByCity(String city) {
        log.info("[WeatherService] Fetching weather for city: {}", city);
        String url = OWM_BASE_URL + "?q=" + city + "&appid=" + apiKey + "&units=metric";
        return fetchAndMapWeather(url);
    }

    @Cacheable(value = "weather_current", key = "T(java.lang.Math).round(#p0 * 100) / 100.0 + ',' + T(java.lang.Math).round(#p1 * 100) / 100.0", unless = "#result == null")
    public WeatherResponseDto getCurrentWeatherByCoordinates(Double lat, Double lon) {
        log.info("[WeatherService] Fetching weather for coordinates: {}, {}", lat, lon);
        String url = OWM_BASE_URL + "?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=metric";
        return fetchAndMapWeather(url);
    }

    private WeatherResponseDto fetchAndMapWeather(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            return parseResponse(response);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new ResourceNotFoundException("Location not found");
            } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                log.error("[WeatherService] OpenWeatherMap quota exceeded (429)");
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Weather service is temporarily unavailable due to rate limits");
            }
            log.error("[WeatherService] Client error calling OpenWeatherMap: {} - {}", e.getStatusCode(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch weather data");
        } catch (HttpServerErrorException e) {
            log.error("[WeatherService] Server error calling OpenWeatherMap: {} - {}", e.getStatusCode(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Upstream weather service error");
        } catch (ResourceAccessException e) {
            log.error("[WeatherService] Network/Timeout error calling OpenWeatherMap: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Timeout connecting to weather service");
        } catch (Exception e) {
            log.error("[WeatherService] Unexpected error processing weather data: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error processing weather");
        }
    }

    private WeatherResponseDto parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            String city = root.path("name").asText();
            
            JsonNode main = root.path("main");
            double temp = main.path("temp").asDouble();
            int humidity = main.path("humidity").asInt();
            
            JsonNode weatherArray = root.path("weather");
            if (!weatherArray.isArray() || weatherArray.isEmpty()) {
                throw new IllegalArgumentException("Malformed response: weather array is missing or empty");
            }
            JsonNode weather = weatherArray.get(0);
            String condition = weather.path("main").asText();
            String description = weather.path("description").asText();
            String iconCode = weather.path("icon").asText();
            
            JsonNode wind = root.path("wind");
            double windSpeedMs = wind.path("speed").asDouble();
            double windSpeedKph = windSpeedMs * 3.6; // Convert m/s to km/h
            
            return new WeatherResponseDto(
                city,
                temp,
                condition,
                description,
                iconCode,
                humidity,
                Math.round(windSpeedKph * 10.0) / 10.0 // 1 decimal place
            );
        } catch (Exception e) {
            log.error("[WeatherService] Failed to map OpenWeatherMap response: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error mapping weather data");
        }
    }
}
