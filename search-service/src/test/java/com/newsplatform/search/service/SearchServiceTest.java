package com.newsplatform.search.service;

import com.newsplatform.search.client.NewsServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private NewsServiceClient newsServiceClient;

    @InjectMocks
    private SearchService searchService;

    @Test
    void search_ShouldForwardQueryToNewsServiceClient() {
        // Arrange
        Object mockResponse = Map.of("content", "test articles");
        when(newsServiceClient.searchArticles("AI", "Tech", null, null, null, null, 0, 20, "publishedAt", "DESC"))
                .thenReturn(mockResponse);

        // Act
        Object result = searchService.search("AI", "Tech", null, null, null, null, 0, 20, "publishedAt", "DESC");

        // Assert
        assertNotNull(result);
        assertEquals(mockResponse, result);
        verify(newsServiceClient).searchArticles("AI", "Tech", null, null, null, null, 0, 20, "publishedAt", "DESC");
    }
}
