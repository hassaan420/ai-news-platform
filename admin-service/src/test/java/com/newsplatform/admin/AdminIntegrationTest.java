package com.newsplatform.admin;

import com.newsplatform.admin.client.AuthServiceClient;
import com.newsplatform.admin.client.CategoryServiceClient;
import com.newsplatform.admin.client.NewsServiceClient;
import com.newsplatform.admin.dto.CategoryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryServiceClient categoryServiceClient;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    @MockitoBean
    private NewsServiceClient newsServiceClient;

    @Test
    @WithMockUser(roles = "USER")
    void adminRoutes_ShouldRejectNonAdminUser() throws Exception {
        mockMvc.perform(get("/api/admin/categories"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminRoutes_ShouldAllowAdminUser() throws Exception {
        CategoryDto mockCategory = new CategoryDto(1L, "Test", "test", "icon", true, Instant.now(), Instant.now());
        when(categoryServiceClient.getAllCategories()).thenReturn(List.of(mockCategory));

        mockMvc.perform(get("/api/admin/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test"));
    }
}
