package com.newsplatform.category.controller;

import com.newsplatform.category.config.SecurityConfig;
import com.newsplatform.category.dto.WeatherResponseDto;
import com.newsplatform.category.service.WeatherService;
import com.newsplatform.common.security.InternalApiKeyFilter;
import com.newsplatform.common.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(WeatherController.class)
@Import(SecurityConfig.class) // Import SecurityConfig to test the public endpoint permitAll rule
public class WeatherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WeatherService weatherService;
    
    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private InternalApiKeyFilter internalApiKeyFilter;

    @Test
    public void testGetCurrentWeather_WithCity_HappyPath() throws Exception {
        WeatherResponseDto mockResponse = new WeatherResponseDto("London", 15.0, "Clouds", "overcast", "04d", 82, 10.5);
        Mockito.when(weatherService.getCurrentWeatherByCity(anyString())).thenReturn(mockResponse);

        // Verifying public access without auth tokens
        mockMvc.perform(get("/api/weather/current?city=London"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city").value("London"))
                .andExpect(jsonPath("$.temperatureCelsius").value(15.0));
    }

    @Test
    public void testGetCurrentWeather_WithCoordinates_HappyPath() throws Exception {
        WeatherResponseDto mockResponse = new WeatherResponseDto("London", 15.0, "Clouds", "overcast", "04d", 82, 10.5);
        Mockito.when(weatherService.getCurrentWeatherByCoordinates(anyDouble(), anyDouble())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/weather/current?lat=51.51&lon=-0.13"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city").value("London"));
    }

    @Test
    public void testGetCurrentWeather_MissingParams_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/weather/current"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetCurrentWeather_OnlyLat_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/weather/current?lat=51.51"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetCurrentWeather_OnlyLon_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/weather/current?lon=-0.13"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetCurrentWeather_OutOfRangeCoordinates_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/weather/current?lat=95.0&lon=0.0"))
                .andExpect(status().isBadRequest());
                
        mockMvc.perform(get("/api/weather/current?lat=0.0&lon=190.0"))
                .andExpect(status().isBadRequest());
    }
}
