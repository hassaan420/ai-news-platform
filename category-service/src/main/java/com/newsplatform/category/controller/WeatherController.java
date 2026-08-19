package com.newsplatform.category.controller;

import com.newsplatform.category.dto.WeatherResponseDto;
import com.newsplatform.category.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@Tag(name = "Weather API", description = "Endpoints for fetching current weather data")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    @Operation(summary = "Get current weather by city or coordinates")
    public ResponseEntity<WeatherResponseDto> getCurrentWeather(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lon", required = false) Double lon) {
        
        boolean hasCity = StringUtils.hasText(city);
        boolean hasLatLon = (lat != null && lon != null);
        
        if (!hasCity && !hasLatLon) {
            return ResponseEntity.badRequest().build();
        }
        
        if ((lat != null && lon == null) || (lat == null && lon != null)) {
            return ResponseEntity.badRequest().build();
        }

        if (hasLatLon) {
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(weatherService.getCurrentWeatherByCoordinates(lat, lon));
        }

        return ResponseEntity.ok(weatherService.getCurrentWeatherByCity(city));
    }
}
