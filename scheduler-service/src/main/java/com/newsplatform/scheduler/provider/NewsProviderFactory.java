package com.newsplatform.scheduler.provider;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class NewsProviderFactory {

    private final Map<String, NewsProvider> providerMap;
    private final List<NewsProvider> sortedProviders;

    public NewsProviderFactory(List<NewsProvider> providers) {
        this.providerMap = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toLowerCase(),
                        p -> p,
                        (p1, p2) -> p1
                ));
        this.sortedProviders = providers.stream()
                .sorted(Comparator.comparingInt(NewsProvider::getPriority))
                .collect(Collectors.toList());
    }

    public NewsProvider getProvider(String providerName) {
        if (providerName == null) return null;
        return providerMap.get(providerName.toLowerCase());
    }

    public List<NewsProvider> getAllProviders() {
        return sortedProviders;
    }
}
