package com.newsplatform.auth.config;

import com.newsplatform.common.security.InternalApiKeyFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for auth-service.
 * Configures BCrypt strength 12, stateless session, and public endpoints permitAll.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final InternalApiKeyFilter internalApiKeyFilter;

  public SecurityConfig(InternalApiKeyFilter internalApiKeyFilter) {
    this.internalApiKeyFilter = internalApiKeyFilter;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .cors(org.springframework.security.config.Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(
                "/api/auth/**",
                "/actuator/health",
                "/actuator/info",
                "/actuator/metrics",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
      org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
      configuration.setAllowedOriginPatterns(java.util.List.of("*"));
      configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(java.util.List.of("*"));
      configuration.setAllowCredentials(true);
      org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
  }
}
