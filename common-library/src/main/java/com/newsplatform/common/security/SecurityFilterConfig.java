package com.newsplatform.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class SecurityFilterConfig {

    @Bean
    public InternalApiKeyFilter internalApiKeyFilter(@Value("${internal.api.key:internal-service-key-2026}") String internalApiKey) {
        InternalApiKeyFilter filter = new InternalApiKeyFilter();
        filter.setInternalApiKey(internalApiKey);
        return filter;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(@Value("${jwt.secret:changeme_jwt_secret_min_32_chars_long}") String jwtSecret) {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
        filter.setJwtSecret(jwtSecret);
        return filter;
    }
}
