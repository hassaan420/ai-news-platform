package com.newsplatform.common.security;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

public class FeignInternalApiKeyInterceptor implements RequestInterceptor {

    @Value("${internal.api.key:internal-service-key-2026}")
    private String internalApiKey;

    @Override
    public void apply(RequestTemplate template) {
        template.header("Internal-Api-Key", internalApiKey);
    }
}
