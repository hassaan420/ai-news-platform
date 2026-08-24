package com.newsplatform.news.controller;

import java.time.Instant;

import com.newsplatform.news.BaseIntegrationTest;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.Source;
import com.newsplatform.news.entity.UserReadingHistory;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.SourceRepository;
import com.newsplatform.news.repository.UserReadingHistoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.util.Date;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
public class UserActivityControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserReadingHistoryRepository historyRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SourceRepository sourceRepository;

    private String validToken;
    private String userId = "123";

    @BeforeEach
    void setUp() {
        historyRepository.deleteAll();
        articleRepository.deleteAll();
        sourceRepository.deleteAll();

        // Generate token for user 123
        validToken = Jwts.builder()
                .subject(String.valueOf(123L))
                .claim("role", "ROLE_USER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(Keys.hmacShaKeyFor("very_long_test_secret_for_jwt_validation_must_be_256_bits".getBytes()))
                .compact();

        Source source = new Source();
        source.setProvider("TEST");
        source.setName("Test Source");
        source.setEndpoint("http://test.com");
        source = sourceRepository.save(source);

        Article article1 = new Article();
        article1.setTitle("Test Article 1");
        article1.setUrl("http://test.com/1");
        article1.setHash("hash1");
        article1.setSource(source);
        article1.setCategoryId(1L);
        article1.setPublishedAt(Instant.now());
        article1 = articleRepository.save(article1);

        Article article2 = new Article();
        article2.setTitle("Test Article 2");
        article2.setUrl("http://test.com/2");
        article2.setHash("hash2");
        article2.setSource(source);
        article2.setCategoryId(1L);
        article2.setPublishedAt(Instant.now());
        article2 = articleRepository.save(article2);

        UserReadingHistory history1 = new UserReadingHistory();
        history1.setUserId(userId);
        history1.setArticle(article1);
        historyRepository.save(history1);

        UserReadingHistory history2 = new UserReadingHistory();
        history2.setUserId(userId);
        history2.setArticle(article2);
        historyRepository.save(history2);

        // History for a different user
        UserReadingHistory otherUserHistory = new UserReadingHistory();
        otherUserHistory.setUserId("999");
        otherUserHistory.setArticle(article1);
        historyRepository.save(otherUserHistory);
    }

    @AfterEach
    void tearDown() {
        historyRepository.deleteAll();
        articleRepository.deleteAll();
        sourceRepository.deleteAll();
    }

    @Test
    void getReadingCount_Success() throws Exception {
        mockMvc.perform(get("/api/news/me/reading-count")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articlesRead", is(2)));
    }

    @Test
    void getReadingCount_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/news/me/reading-count")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
