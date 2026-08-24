package com.newsplatform.news.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.ArticleVerification;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.ArticleVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class ArticleVerificationServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private ArticleVerificationRepository verificationRepository;

    @Mock
    private AiService aiService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ArticleVerificationService verificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRunVerification_ArticleNotFound() {
        when(articleRepository.findById(anyLong())).thenReturn(Optional.empty());
        verificationService.runVerification(1L);
        verify(verificationRepository, never()).save(any());
    }

    @Test
    void testRunVerification_NoTitle() {
        Article article = new Article();
        article.setId(1L);
        when(articleRepository.findById(anyLong())).thenReturn(Optional.of(article));
        
        verificationService.runVerification(1L);
        verify(verificationRepository, never()).save(any());
    }

    @Test
    void testRunVerification_Success() {
        Article article = new Article();
        article.setId(1L);
        article.setTitle("Test Title");
        article.setContent("Test Content");
        
        when(articleRepository.findById(anyLong())).thenReturn(Optional.of(article));
        
        GeminiAiProvider.CorroborationAnalysis analysis = new GeminiAiProvider.CorroborationAnalysis(90, 2, "VERIFIED", Collections.emptyList());
        when(aiService.verifyCorroboration(anyString(), anyList())).thenReturn(analysis);
        
        when(verificationRepository.findByArticleId(anyLong())).thenReturn(Optional.empty());
        
        verificationService.runVerification(1L);
        
        verify(verificationRepository, times(1)).save(any(ArticleVerification.class));
    }
}
