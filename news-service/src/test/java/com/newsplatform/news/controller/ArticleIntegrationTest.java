package com.newsplatform.news.controller;

import com.newsplatform.news.BaseIntegrationTest;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.repository.ArticleRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import com.newsplatform.news.entity.Source;
import com.newsplatform.news.repository.SourceRepository;
import java.time.Instant;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class ArticleIntegrationTest extends BaseIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SourceRepository sourceRepository;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        articleRepository.deleteAll();
        sourceRepository.deleteAll();

        // Setup test data
        Source source = new Source();
        source.setName("Test Source");
        source.setProvider("test");
        source.setEndpoint("http://test");
        source.setStatus("ACTIVE");
        source = sourceRepository.save(source);

        Article article = new Article();
        article.setTitle("REST Assured Test Article");
        article.setContent("This is a test article content");
        article.setUrl("http://example.com/test");
        article.setHash("hash123");
        article.setSource(source);
        article.setCategoryId(1L);
        article.setPublishedAt(Instant.now());
        articleRepository.save(article);
    }

    @Test
    void testGetArticles_Success() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/articles")
        .then()
            .statusCode(HttpStatus.OK.value())
            .body("content", hasSize(greaterThanOrEqualTo(1)))
            .body("content[0].title", equalTo("REST Assured Test Article"));
    }

    @Test
    void testGetArticleById_NotFound() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/articles/999999")
        .then()
            .statusCode(HttpStatus.NOT_FOUND.value());
    }
}
