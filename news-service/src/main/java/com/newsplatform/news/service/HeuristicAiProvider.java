package com.newsplatform.news.service;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fallback AI implementation that produces reasonable-enough summaries,
 * sentiment labels and keywords using simple text heuristics. No network
 * access, no LLM — always available.
 *
 * <p>Extracted from the original monolithic {@code AiService} as part of the
 * Gemini integration (see {@link AiService} for the orchestrator).
 */
@Component
public class HeuristicAiProvider implements AiProvider {

    private static final List<String> POS_WORDS = Arrays.asList(
        "good", "great", "excellent", "positive", "success", "innovative",
        "growth", "win", "boost", "improve", "strong", "best"
    );

    private static final List<String> NEG_WORDS = Arrays.asList(
        "bad", "terrible", "poor", "negative", "fail", "decline",
        "crash", "loss", "weak", "worst", "drop", "concern"
    );

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String name() {
        return "heuristic";
    }

    @Override
    public String summarize(String content) {
        if (content == null || content.isBlank()) return "";
        String[] sentences = content.trim().split("(?<=[.!?])\\s+");
        return Arrays.stream(sentences).limit(2).collect(Collectors.joining(" "));
    }

    @Override
    public AiProvider.SentimentResult sentiment(String content) {
        if (content == null || content.isBlank()) {
            return new AiProvider.SentimentResult("Neutral", 0.0);
        }
        String lower = content.toLowerCase(Locale.ROOT);
        int pos = countOccurrences(lower, POS_WORDS);
        int neg = countOccurrences(lower, NEG_WORDS);

        double score = (double) (pos - neg) / Math.max(1, pos + neg);
        String label = score > 0.2 ? "Positive" : (score < -0.2 ? "Negative" : "Neutral");
        return new AiProvider.SentimentResult(label, score);
    }

    @Override
    public List<String> keywords(String content, int maxKeywords) {
        if (content == null || content.isBlank()) return Collections.emptyList();
        Map<String, Long> wordCounts = Arrays.stream(content.split("\\W+"))
            .map(String::toLowerCase)
            .filter(w -> w.length() > 6)
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

        return wordCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(maxKeywords)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    /** Tag generation: derive simple uppercase tags from the top keywords. */
    public List<String> tags(String title, String content) {
        List<String> keywords = keywords((title == null ? "" : title) + " " + (content == null ? "" : content), 3);
        return keywords.stream().map(String::toUpperCase).collect(Collectors.toList());
    }

    private int countOccurrences(String text, List<String> words) {
        return words.stream().mapToInt(w -> {
            int count = 0;
            int idx = 0;
            while ((idx = text.indexOf(w, idx)) != -1) {
                count++;
                idx += w.length();
            }
            return count;
        }).sum();
    }
}
