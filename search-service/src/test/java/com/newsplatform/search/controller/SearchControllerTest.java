package com.newsplatform.search.controller;

import com.newsplatform.search.service.SearchService;
import com.newsplatform.common.security.InternalApiKeyFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
@AutoConfigureMockMvc(addFilters = false)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SearchService searchService;
    
    @MockitoBean
    private InternalApiKeyFilter internalApiKeyFilter;

    @Test
    void search_ShouldReturnOkAndData() throws Exception {
        Object mockResponse = Map.of("content", "test data");
        when(searchService.search(anyString(), isNull(), isNull(), isNull(), isNull(), isNull(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/news/search")
                .param("q", "AI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("test data"));
    }
    
    @Test
    void search_WithEmptyQuery_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/news/search")
                .param("q", ""))
                .andExpect(status().isBadRequest());
    }
}
