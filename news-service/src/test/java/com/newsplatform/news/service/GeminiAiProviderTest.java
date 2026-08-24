package com.newsplatform.news.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GeminiAiProviderTest {

    @Mock
    private GeminiClient client;

    private GeminiAiProvider provider;

    @BeforeEach
    void setUp() {
        provider = new GeminiAiProvider(client);
    }

    @Test
    void isEnabled_whenClientConfigured_returnsTrue() {
        when(client.isConfigured()).thenReturn(true);
        assertTrue(provider.isEnabled());
    }

    @Test
    void summarize_withValidResponse_returnsStrippedSummary() {
        when(client.generate(anyString())).thenReturn("```json\n{\"summary\": \"Here is a summary.\", \"sentiment\": {\"label\": \"Neutral\", \"score\": 0.1}, \"keywords\": [\"test\"]}\n```");
        String result = provider.summarize("Some article text...");
        assertEquals("Here is a summary.", result);
    }

    @Test
    void summarize_withEmptyResponse_throwsException() {
        when(client.generate(anyString())).thenReturn("");
        
        assertThrows(GeminiAiProvider.GeminiCallException.class, () -> {
            provider.summarize("Some article text...");
        });
    }

    @Test
    void sentiment_withValidJson_returnsSentimentResult() {
        when(client.generate(anyString())).thenReturn("```json\n{\"summary\": \"...\", \"sentiment\": {\"label\":\"Positive\",\"score\":0.8}, \"keywords\": []}\n```");
        
        AiProvider.SentimentResult result = provider.sentiment("Good news today!");
        
        assertEquals("Positive", result.sentiment());
        assertEquals(0.8, result.score());
    }

    @Test
    void sentiment_withMalformedJson_throwsException() {
        when(client.generate(anyString())).thenReturn("Not a JSON object");
        
        assertThrows(GeminiAiProvider.GeminiCallException.class, () -> {
            provider.sentiment("Good news today!");
        });
    }

    @Test
    void keywords_withValidJsonArray_returnsKeywordsList() {
        when(client.generate(anyString())).thenReturn("```json\n{\"summary\": \"...\", \"sentiment\": {\"label\": \"Neutral\", \"score\": 0.0}, \"keywords\": [\"tech\", \"ai\"]}\n```");
        
        List<String> result = provider.keywords("Tech and AI are cool.", 2);
        
        assertEquals(2, result.size());
        assertEquals("tech", result.get(0));
        assertEquals("ai", result.get(1));
    }
}
