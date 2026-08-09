package com.newsplatform.news.service;

import com.newsplatform.news.entity.*;
import com.newsplatform.news.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ArticleAiProcessingServiceTest {

    @Mock
    private AiService aiService;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private ArticleKeywordRepository keywordRepository;
    @Mock
    private ArticleTagRepository tagRepository;
    @Mock
    private AiProcessingQueueRepository queueRepository;

    @InjectMocks
    private ArticleAiProcessingService service;

    private Article article;
    private AiProcessingQueue queue;

    @BeforeEach
    void setUp() {
        article = new Article();
        article.setId(1L);
        article.setTitle("Test Title");
        article.setContent("Test Content");

        queue = new AiProcessingQueue();
        queue.setId(10L);
        queue.setStatus("PENDING");
    }

    @Test
    void processArticleAsync_Success() {
        // Arrange
        when(queueRepository.findById(10L)).thenReturn(Optional.of(queue));
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        
        when(aiService.generateSummary(anyString())).thenReturn("Generated Summary");
        
        AiService.SentimentResult sentiment = new AiService.SentimentResult("POSITIVE", 0.95);
        when(aiService.analyzeSentiment(anyString())).thenReturn(sentiment);
        
        when(aiService.extractKeywords(anyString())).thenReturn(List.of("AI", "Testing"));
        when(aiService.generateTags(anyString(), anyString())).thenReturn(List.of("Tech"));

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
        verify(queueRepository, times(2)).save(queue);
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
        verify(queueRepository, times(2)).save(queue);
    }
}
