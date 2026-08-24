package com.newsplatform.news.service;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class DuplicateDetectionService {

    public String computeArticleHash(String title, String url) {
        if (title == null || url == null) {
            throw new IllegalArgumentException("Title and URL cannot be null for hash computation");
        }

        String normalizedTitle = title.trim().toLowerCase();
        String normalizedUrl = normalizeUrl(url);

        String rawContent = normalizedTitle + "|" + normalizedUrl;

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawContent.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to compute SHA-256 hash", e);
        }
    }

    private String normalizeUrl(String url) {
        String normalized = url.trim();
        // Remove query parameters
        int questionMarkIndex = normalized.indexOf('?');
        if (questionMarkIndex != -1) {
            normalized = normalized.substring(0, questionMarkIndex);
        }
        // Remove trailing slashes
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
