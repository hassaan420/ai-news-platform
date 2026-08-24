package com.newsplatform.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsplatform.auth.dto.request.UpdateProfileRequestDto;
import com.newsplatform.auth.entity.User;
import com.newsplatform.auth.model.Role;
import com.newsplatform.auth.repository.UserRepository;
import com.newsplatform.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
@AutoConfigureMockMvc
public class AuthControllerProfileTest {

    @Container
    public static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("auth_test_db")
            .withUsername("newsplatform")
            .withPassword("testpassword");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mysqlContainer::getUsername);
        registry.add("spring.datasource.password", mysqlContainer::getPassword);
        registry.add("jwt.secret", () -> "very_long_test_secret_for_jwt_validation_must_be_256_bits");
        registry.add("jwt.expiration-ms", () -> "3600000");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String validToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User("John Doe", "john@test.com", passwordEncoder.encode("password123"), Role.ROLE_USER);
        testUser = userRepository.save(user);

        validToken = jwtTokenProvider.generateAccessToken(testUser);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    void updateProfile_Success() throws Exception {
        UpdateProfileRequestDto request = new UpdateProfileRequestDto("John Updated", "New bio here");

        mockMvc.perform(put("/api/auth/me")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testUser.getId().intValue())))
                .andExpect(jsonPath("$.name", is("John Updated")))
                .andExpect(jsonPath("$.email", is("john@test.com")))
                .andExpect(jsonPath("$.bio", is("New bio here")));
                
        // Verify in DB
        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assert(updated.getName().equals("John Updated"));
        assert(updated.getBio().equals("New bio here"));
    }

    @Test
    void updateProfile_BlankNameRejected() throws Exception {
        UpdateProfileRequestDto request = new UpdateProfileRequestDto("", "New bio here");

        mockMvc.perform(put("/api/auth/me")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProfile_Unauthorized() throws Exception {
        UpdateProfileRequestDto request = new UpdateProfileRequestDto("John Updated", "New bio here");

        mockMvc.perform(put("/api/auth/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
