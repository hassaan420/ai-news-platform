package com.newsplatform.admin.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PrometheusService {

    private final RestTemplate restTemplate;
    private final String prometheusUrl;

    public PrometheusService(@Value("${prometheus.url:http://prometheus:9090}") String prometheusUrl) {
        this.restTemplate = new RestTemplate();
        this.prometheusUrl = prometheusUrl;
    }

    /**
     * Query Prometheus for a metric and return its scalar value as a string (if available).
     */
    public Optional<String> queryMetric(String query) {
        try {
            String url = prometheusUrl + "/api/v1/query?query=" + query;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null) {
                    List<Map<String, Object>> result = (List<Map<String, Object>>) data.get("result");
                    if (result != null && !result.isEmpty()) {
                        List<Object> valueTuple = (List<Object>) result.get(0).get("value");
                        if (valueTuple != null && valueTuple.size() > 1) {
                            return Optional.of(valueTuple.get(1).toString());
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Silently fail if prometheus is down or unreachable
            System.err.println("Failed to query Prometheus for " + query + ": " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<Map<String, Object>> queryRangeMetric(String query, long start, long end, String step) {
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        try {
            String url = prometheusUrl + "/api/v1/query_range?query=" + java.net.URLEncoder.encode(query, "UTF-8") + "&start=" + start + "&end=" + end + "&step=" + step;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null) {
                    List<Map<String, Object>> result = (List<Map<String, Object>>) data.get("result");
                    if (result != null && !result.isEmpty()) {
                        List<List<Object>> values = (List<List<Object>>) result.get(0).get("values");
                        if (values != null) {
                            for (List<Object> val : values) {
                                double timestamp = Double.parseDouble(val.get(0).toString());
                                String valueStr = val.get(1).toString();
                                dataPoints.add(Map.of("time", (long) timestamp, "value", Double.parseDouble(valueStr)));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to query range from Prometheus for " + query + ": " + e.getMessage());
        }
        return dataPoints;
    }

    /**
     * Fetch a 7-day trend (e.g., requests per day) using a matrix query.
     */
    public List<Map<String, Object>> get7DayActivityTrend() {
        List<Map<String, Object>> chartData = new ArrayList<>();
        long end = System.currentTimeMillis() / 1000;
        long start = end - (6 * 24 * 60 * 60); // 7 data points including today
        String step = "1d";

        List<Map<String, Object>> usersData = queryRangeMetric("sum(increase(http_server_requests_seconds_count[1d]))", start, end, step);
        List<Map<String, Object>> articlesData = queryRangeMetric("sum(increase(jvm_memory_used_bytes[1d]))", start, end, step);

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("EEE");
        
        if (usersData.isEmpty()) {
            for (int i = 6; i >= 0; i--) {
                java.time.LocalDateTime date = java.time.LocalDateTime.now().minusDays(i);
                chartData.add(Map.of("name", date.format(formatter), "users", 0, "articles", 0));
            }
            return chartData;
        }

        for (int i = 0; i < usersData.size(); i++) {
            Map<String, Object> uPoint = usersData.get(i);
            long timestamp = (long) uPoint.get("time");
            double uVal = (double) uPoint.get("value");
            double aVal = 0;
            if (i < articlesData.size()) {
                aVal = ((double) articlesData.get(i).get("value")) / 1000000.0; // scale down
            }

            java.time.LocalDateTime date = java.time.LocalDateTime.ofInstant(java.time.Instant.ofEpochSecond(timestamp), java.time.ZoneId.systemDefault());
            chartData.add(Map.of("name", date.format(formatter), "users", (int) uVal, "articles", (int) Math.max(0, (int) aVal)));
        }

        return chartData;
    }

    /**
     * Fetch total HTTP requests processed by all services.
     */
    public String getTotalHttpRequests() {
        return queryMetric("sum(http_server_requests_seconds_count)").orElse("0");
    }

    /**
     * Get system memory usage (JVM).
     */
    public String getJvmMemoryUsed() {
        return queryMetric("sum(jvm_memory_used_bytes)").orElse("0");
    }
}
