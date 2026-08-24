package com.newsplatform.news.service;

import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.news.dto.NewsRequest;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.Source;
import com.newsplatform.news.mapper.NewsMapper;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.SourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private SourceRepository sourceRepository;

    @Mock
    private NewsMapper newsMapper;

    @Mock
    private com.newsplatform.news.repository.AiProcessingQueueRepository aiProcessingQueueRepository;

    @Mock
    private com.newsplatform.news.repository.ArticleStatsRepository articleStatsRepository;

    @Mock
    private com.newsplatform.news.service.ArticleAiProcessingService aiProcessingService;

    @InjectMocks
    private ArticleServiceImpl articleService;

    private NewsRequest request;

    @BeforeEach
    void setUp() {
        request = new NewsRequest(1L, 1L, "Title", "Desc", "Content", "img", "url", "auth", "en", Instant.now(), "hash");
    }

    @Test
    void testCreateInternalNews_Conflict() {
        when(articleRepository.findByHash(anyString())).thenReturn(Optional.of(new Article()));
        assertThrows(ConflictException.class, () -> articleService.createInternalNews(request));
    }

    @Test
    void testCreateInternalNews_Success() {
        Source source = new Source();
        source.setId(1L);

        Article article = new Article();
        article.setId(1L);
        
        com.newsplatform.news.entity.AiProcessingQueue queue = new com.newsplatform.news.entity.AiProcessingQueue();
        queue.setId(1L);

        when(articleRepository.findByHash(anyString())).thenReturn(Optional.empty());
        when(sourceRepository.findById(1L)).thenReturn(Optional.of(source));
        when(newsMapper.toEntity(any(NewsRequest.class))).thenReturn(article);
        when(articleRepository.save(any(Article.class))).thenReturn(article);
        when(aiProcessingQueueRepository.save(any(com.newsplatform.news.entity.AiProcessingQueue.class))).thenReturn(queue);

        articleService.createInternalNews(request);
        verify(articleRepository).save(any(Article.class));
        verify(aiProcessingQueueRepository).save(any(com.newsplatform.news.entity.AiProcessingQueue.class));
        verify(aiProcessingService).processArticleAsync(1L, 1L);
    }
}
