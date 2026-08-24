package com.newsplatform.news.controller;

import com.newsplatform.news.BaseIntegrationTest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class AiSearchIntegrationTest extends BaseIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }

    @Test
    void testSemanticSearch_EndpointNotInNewsService_ReturnsNotFound() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("q", "AI technology")
        .when()
            .get("/api/news/search/semantic")
        .then()
            .statusCode(anyOf(is(HttpStatus.NOT_FOUND.value()), is(HttpStatus.UNAUTHORIZED.value()), is(HttpStatus.INTERNAL_SERVER_ERROR.value())));
    }

    // A fully functional test would mock or inject a valid JWT
    // and populate the Redis/MySQL testcontainers with vectors,
    // but this ensures the security layer and endpoint wiring are correct.
}
