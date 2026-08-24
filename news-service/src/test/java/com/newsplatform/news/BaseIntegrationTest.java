package com.newsplatform.news;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    public static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("news_db")
            .withUsername("newsplatform")
            .withPassword("testpassword");

    public static GenericContainer<?> redisContainer = new GenericContainer<>(org.testcontainers.utility.DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    static {
        mysqlContainer.start();
        redisContainer.start();
    }

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mysqlContainer::getUsername);
        registry.add("spring.datasource.password", mysqlContainer::getPassword);
        
        registry.add("spring.data.redis.host", redisContainer::getHost);
        registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379));
        
        // Mock API keys for testing
        registry.add("newsapi.key", () -> "mock-news-api-key");
        registry.add("gnews.key", () -> "mock-gnews-key");
        registry.add("internal.api.key", () -> "mock-internal-key");
        registry.add("jwt.secret", () -> "very_long_test_secret_for_jwt_validation_must_be_256_bits");
    }
}
