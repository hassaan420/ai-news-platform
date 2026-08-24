package com.newsplatform.news.service;

import com.newsplatform.news.client.CategoryServiceClient;
import com.newsplatform.news.dto.ArticleIngestDto;
import com.newsplatform.news.dto.CategoryDto;
import com.newsplatform.news.dto.IngestionResultDto;
import com.newsplatform.news.dto.NewsRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class IngestionPipelineServiceTest {

    @Mock
    private DuplicateDetectionService duplicateDetectionService;

    @Mock
    private CacheEvictionService cacheEvictionService;

    @Mock
    private ArticleService articleService;

    @Mock
    private CategoryServiceClient categoryServiceClient;

    @InjectMocks
    private IngestionPipelineService ingestionPipelineService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testIngestArticles_Success() {
        ArticleIngestDto dto = new ArticleIngestDto("Test Title", "Desc", "Content", "image", "http://test.com", "Author", 1L, "tech", java.time.Instant.now());
        
        when(categoryServiceClient.getAllCategories()).thenReturn(List.of(
            new CategoryDto(1L, "Technology", "tech", "icon", true, java.time.Instant.now(), java.time.Instant.now())
        ));
        
        when(duplicateDetectionService.computeArticleHash(anyString(), anyString())).thenReturn("hash123");
        
        IngestionResultDto result = ingestionPipelineService.ingestArticles(List.of(dto));
        
        assertEquals(1, result.articlesFetched());
        assertEquals(1, result.articlesStored());
        assertEquals(0, result.duplicatesSkipped());
        assertEquals(0, result.errors().size());
        
        verify(articleService, times(1)).createInternalNews(any(NewsRequest.class));
        verify(cacheEvictionService, times(1)).evictHomepageCache();
        verify(cacheEvictionService, times(1)).evictTrendingCache();
        verify(cacheEvictionService, times(1)).evictCategoryCache("tech");
    }

    @Test
    void testIngestArticles_Duplicate() {
        ArticleIngestDto dto = new ArticleIngestDto("Test Title", "Desc", "Content", "image", "http://test.com", "Author", 1L, "tech", java.time.Instant.now());
        
        when(categoryServiceClient.getAllCategories()).thenReturn(List.of());
        when(duplicateDetectionService.computeArticleHash(anyString(), anyString())).thenReturn("hash123");
        
        doThrow(new com.newsplatform.common.exception.ConflictException("Duplicate")).when(articleService).createInternalNews(any(NewsRequest.class));
        
        IngestionResultDto result = ingestionPipelineService.ingestArticles(List.of(dto));
        
        assertEquals(1, result.articlesFetched());
        assertEquals(0, result.articlesStored());
        assertEquals(1, result.duplicatesSkipped());
        assertEquals(0, result.errors().size());
        
        verify(cacheEvictionService, never()).evictHomepageCache();
    }
}
