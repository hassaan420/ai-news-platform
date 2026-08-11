package com.newsplatform.news.controller;

import com.newsplatform.news.config.SecurityConfig;
import com.newsplatform.news.dto.NewsResponse;
import com.newsplatform.news.dto.NewsSummaryResponse;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.common.security.JwtAuthenticationFilter;
import com.newsplatform.common.security.InternalApiKeyFilter;
import com.newsplatform.news.service.ArticleService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArticleController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, InternalApiKeyFilter.class})
public class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArticleService articleService;

    @Test
    public void testGetArticles_ReturnsPagedResponse() throws Exception {
        NewsSummaryResponse summary = new NewsSummaryResponse(
                1L, "Title", "Desc", "img", "url", "author", Instant.now(), 1L, null,
                null, null, null, null, null, null, null, null, null, null, null, null, 0, 0);
        PagedResponse<NewsSummaryResponse> response = new PagedResponse<>(
                List.of(summary), 0, 20, 1, 1, true);

        Mockito.when(articleService.getArticles(any(Pageable.class))).thenReturn(response);

        mockMvc.perform(get("/api/news")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    public void testGetArticleById_ReturnsArticle() throws Exception {
        NewsResponse article = new NewsResponse(
                1L, "Title", "Desc", "content", "img", "url", "author", "en", Instant.now(), "hash", 1L, null, 
                null, null, null, null, null, null, null, null, null, null, null, null, null, 0, 0);

        Mockito.when(articleService.getArticleById(1L)).thenReturn(article);

        mockMvc.perform(get("/api/news/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Title"));
    }
}
