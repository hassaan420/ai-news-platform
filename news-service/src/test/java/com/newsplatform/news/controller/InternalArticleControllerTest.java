package com.newsplatform.news.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.newsplatform.news.config.SecurityConfig;
import com.newsplatform.news.dto.NewsRequest;
import com.newsplatform.news.dto.NewsResponse;
import com.newsplatform.common.security.JwtAuthenticationFilter;
import com.newsplatform.common.security.InternalApiKeyFilter;
import com.newsplatform.news.service.ArticleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InternalArticleController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, InternalApiKeyFilter.class})
public class InternalArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArticleService articleService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @WithMockUser
    public void testCreateInternalNews_Success() throws Exception {
        NewsRequest request = new NewsRequest(1L, 1L, "Title", "Desc", "content", "img", "url", "author", "en", Instant.now(), "hash");
        NewsResponse response = new NewsResponse(1L, "Title", "Desc", "content", "img", "url", "author", "en", Instant.now(), "hash", 1L, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null);

        Mockito.when(articleService.createInternalNews(any(NewsRequest.class))).thenReturn(response);

        mockMvc.perform(post("/internal/news")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Title"));
    }

    @Test
    @WithMockUser
    public void testCreateInternalNews_ValidationFails() throws Exception {
        // Missing title
        NewsRequest request = new NewsRequest(1L, 1L, null, "Desc", "content", "img", "url", "author", "en", Instant.now(), "hash");

        mockMvc.perform(post("/internal/news")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
