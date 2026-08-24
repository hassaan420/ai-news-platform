package com.newsplatform.news.service;

import com.newsplatform.news.entity.*;
import com.newsplatform.news.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ArticleAiProcessingServiceTest {

    @Mock
    private AiService aiService;
    @Mock
    private GeminiRateLimiter rateLimiter;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private ArticleKeywordRepository keywordRepository;
    @Mock
    private ArticleTagRepository tagRepository;
    @Mock
    private AiProcessingQueueRepository queueRepository;
    @Mock
    private ArticleVerificationService verificationService;

    private ArticleAiProcessingService service;

    private Article article;
    private AiProcessingQueue queue;

    @BeforeEach
    void setUp() {
        service = new ArticleAiProcessingService(
                aiService, rateLimiter, articleRepository,
                keywordRepository, tagRepository, queueRepository,
                verificationService);

        article = new Article();
        article.setId(1L);
        article.setTitle("Test Title");
        article.setContent("Test Content");

        queue = new AiProcessingQueue();
        queue.setId(10L);
        queue.setStatus("PENDING");
        queue.setTaskType("FULL_AI_PROCESSING");
    }

    @Test
    void processArticleAsync_Success() {
        // Arrange
        when(queueRepository.findById(10L)).thenReturn(Optional.of(queue));
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        AiService.SentimentResult sentiment = new AiService.SentimentResult("POSITIVE", 0.95);
        AiService.ArticleAnalysisResult analysis = new AiService.ArticleAnalysisResult(
                "Generated Summary", sentiment, List.of("AI", "Testing"), "gemini");
        when(aiService.analyzeArticle(anyString())).thenReturn(analysis);

        when(keywordRepository.findByArticleId(1L)).thenReturn(Collections.emptyList());
        when(tagRepository.findByArticleId(1L)).thenReturn(Collections.emptyList());
        when(aiService.generateTags(anyString(), anyString())).thenReturn(List.of("Tech"));

        when(queueRepository.save(any(AiProcessingQueue.class))).thenAnswer(invocation -> {
            AiProcessingQueue q = invocation.getArgument(0);
            if (q.getId() == null) q.setId(99L);
            return q;
        });

        // Act
        service.processArticleAsync(1L, 10L);

        // Assert
        assertEquals("Generated Summary", article.getSummary());
        assertEquals("POSITIVE", article.getSentiment());
        assertEquals(0.95, article.getSentimentScore());

        verify(keywordRepository, times(2)).save(any(ArticleKeyword.class));
        verify(tagRepository, times(1)).save(any(ArticleTag.class));
        verify(articleRepository).save(article);

        assertEquals("COMPLETED", queue.getStatus());
    }

    @Test
    void processArticleAsync_ArticleNotFound() {
        // Arrange
        when(queueRepository.findById(10L)).thenReturn(Optional.of(queue));
        when(articleRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        service.processArticleAsync(1L, 10L);

        // Assert
        assertEquals("FAILED", queue.getStatus());
        assertNotNull(queue.getErrorMessage());
    }
}
