package com.newsplatform.news.mapper;

import com.newsplatform.news.dto.*;
import com.newsplatform.news.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class NewsMapperTest {

    private NewsMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(NewsMapper.class);
    }

    @Test
    void toDto_Source() {
        Source source = new Source();
        source.setId(1L);
        source.setName("Test Source");

        SourceDto dto = mapper.toDto(source);

        assertNotNull(dto);
        assertEquals(1L, dto.id());
        assertEquals("Test Source", dto.name());
    }

    @Test
    void toEntity_SourceDto() {
        SourceDto dto = new SourceDto(
                1L, "Test Source DTO", "https://testdto.com", "API", null, null, null
        );

        Source entity = mapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(1L, entity.getId());
        assertEquals("Test Source DTO", entity.getName());
        assertNull(entity.getApiKey());
    }

    @Test
    void toNewsResponse() {
        Article article = new Article();
        article.setId(1L);
        article.setTitle("Test Title");
        article.setContent("Content");
        article.setUrl("https://url.com");
        article.setAuthor("Author");
        article.setSummary("Summary");
        article.setSentiment("POSITIVE");
        article.setSentimentScore(0.9);
        article.setPublishedAt(Instant.now());

        ArticleStats stats = new ArticleStats();
        stats.setViews(100);
        stats.setBookmarks(50);
        article.setStats(stats);

        ArticleKeyword keyword = new ArticleKeyword();
        keyword.setKeyword("AI");
        article.setKeywords(List.of(keyword));

        ArticleTag tag = new ArticleTag();
        tag.setTag("Tech");
        article.setTags(List.of(tag));

        NewsResponse response = mapper.toNewsResponse(article);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test Title", response.title());
        assertEquals("Content", response.content());
        assertEquals("https://url.com", response.url());
        assertEquals("Author", response.author());
        assertEquals("Summary", response.summary());
        assertEquals("POSITIVE", response.sentiment());
        assertEquals(0.9, response.sentimentScore());
        assertEquals(100, response.views());
        assertEquals(50, response.bookmarks());
        assertTrue(response.keywords().contains("AI"));
        assertTrue(response.tags().contains("Tech"));
    }

    @Test
    void toNewsSummaryResponse() {
        Article article = new Article();
        article.setId(1L);
        article.setTitle("Summary Title");
        article.setSummary("Short summary");

        ArticleStats stats = new ArticleStats();
        stats.setViews(5);
        stats.setBookmarks(2);
        article.setStats(stats);

        NewsSummaryResponse response = mapper.toNewsSummaryResponse(article);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Summary Title", response.title());
        assertEquals("Short summary", response.summary());
        assertEquals(5, response.views());
        assertEquals(2, response.bookmarks());
    }

    @Test
    void toNewsSearchResponse() {
        Article article = new Article();
        article.setId(2L);
        article.setTitle("Search Title");

        NewsSearchResponse response = mapper.toNewsSearchResponse(article);

        assertNotNull(response);
        assertEquals(2L, response.id());
        assertEquals("Search Title", response.title());
        assertNull(response.searchScore());
    }

    @Test
    void toEntity_NewsRequest() {
        NewsRequest request = new NewsRequest(
                20L, 10L, "Req Title", null, "Req Content", null, "https://req.com", "Req Author", null, null, null
        );

        Article entity = mapper.toEntity(request);

        assertNotNull(entity);
        assertEquals("Req Title", entity.getTitle());
        assertEquals("Req Content", entity.getContent());
        assertEquals("https://req.com", entity.getUrl());
        assertEquals("Req Author", entity.getAuthor());
        assertEquals(20L, entity.getCategoryId());
        assertNull(entity.getId());
    }

    @Test
    void toSummaryDto() {
        Article article = new Article();
        article.setId(10L);
        article.setTitle("Summary DTO");

        ArticleSummaryDto dto = mapper.toSummaryDto(article);

        assertNotNull(dto);
        assertEquals(10L, dto.id());
        assertEquals("Summary DTO", dto.title());
        assertNull(dto.category());
    }

    @Test
    void toDto_Article() {
        Article article = new Article();
        article.setId(11L);
        article.setTitle("Article DTO");

        ArticleDto dto = mapper.toDto(article);

        assertNotNull(dto);
        assertEquals(11L, dto.id());
        assertEquals("Article DTO", dto.title());
        assertNull(dto.category());
        assertNull(dto.relatedArticles());
    }

    @Test
    void toDto_FetchLog() {
        FetchLog log = new FetchLog();
        log.setId(100L);
        Source source = new Source();
        source.setId(5L);
        log.setSource(source);
        log.setStatus("SUCCESS");
        log.setArticlesFetched(10);
        
        log.setErrorMessage("None");

        FetchLogDto dto = mapper.toDto(log);

        assertNotNull(dto);
        assertEquals(log.getId(), dto.id());
        assertEquals(5L, dto.sourceId());
        assertEquals("SUCCESS", dto.status());
        assertEquals(10, dto.articlesFetched());
        assertEquals("None", dto.errorMessage());
    }

    @Test
    void mapKeywords_Null() {
        List<String> keywords = mapper.mapKeywords(null);
        assertNotNull(keywords);
        assertTrue(keywords.isEmpty());
    }

    @Test
    void mapTags_Null() {
        List<String> tags = mapper.mapTags(null);
        assertNotNull(tags);
        assertTrue(tags.isEmpty());
    }
}
