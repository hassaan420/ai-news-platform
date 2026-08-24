package com.newsplatform.admin.service;

import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CacheEvictionService {

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheEvictionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void evictHomepageCache() {
        evictByPattern("news:latest_articles:*");
    }

    public void evictTrendingCache() {
        evictByPattern("news:trending_articles:*");
    }

    public void evictCategoryCache(String slug) {
        evictByPattern("news:category:" + slug + ":*");
    }
    
    public void evictAllCategoryCaches() {
        evictByPattern("news:category:*");
    }

    public void evictSearchCache() {
        evictByPattern("news:search:*");
    }

    public void evictAllCaches() {
        evictHomepageCache();
        evictTrendingCache();
        evictAllCategoryCaches();
        evictSearchCache();
    }

    private void evictByPattern(String matchPattern) {
        List<String> keys = new ArrayList<>();
        try (Cursor<byte[]> cursor = redisTemplate.getConnectionFactory()
                .getConnection()
                .keyCommands()
                .scan(ScanOptions.scanOptions().match(matchPattern).count(100).build())) {
            while (cursor.hasNext()) {
                keys.add(new String(cursor.next()));
            }
        }
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
