package com.newsplatform.common.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(name = "feign.RequestInterceptor")
public class FeignSecurityConfig {

    @Bean
    public feign.RequestInterceptor feignInternalApiKeyInterceptor() {
        return new FeignInternalApiKeyInterceptor();
    }
}
