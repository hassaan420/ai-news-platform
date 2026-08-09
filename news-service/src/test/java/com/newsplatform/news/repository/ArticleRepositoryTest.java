package com.newsplatform.news.repository;

import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.Source;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.Optional;

import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.boot.autoconfigure.domain.EntityScan;

@DataJpaTest
@ActiveProfiles("test")
@EntityScan("com.newsplatform.news.entity")
public class ArticleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ArticleRepository articleRepository;

    private Source source;
    private Article article;

    @BeforeEach
    public void setup() {
        source = new Source();
        source.setProvider("test_provider");
        source.setName("Test Source");
        source.setEndpoint("http://test.com");
        source.setStatus("ACTIVE");
        entityManager.persist(source);

        article = new Article();
        article.setSource(source);
        article.setCategoryId(1L);
        article.setTitle("Test Title");
        article.setDescription("Test Description");
        article.setContent("Test Content");
        article.setUrl("http://test.com/article");
        article.setLanguage("en");
        article.setPublishedAt(Instant.now());
        article.setHash("test_hash_123");
        entityManager.persist(article);
        
        entityManager.flush();
    }

    @Test
    public void testFindByHash() {
        Optional<Article> found = articleRepository.findByHash("test_hash_123");
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Title");
        assertThat(found.get().getSource().getName()).isEqualTo("Test Source");
    }

}
