package com.newsplatform.news.controller;

import com.newsplatform.news.dto.response.AdminArticleResponseDto;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/admin/articles")
public class InternalAdminController {

    private final ArticleRepository articleRepository;

    public InternalAdminController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @GetMapping("/count")
    public long getArticleCount() {
        return articleRepository.count();
    }

    @GetMapping
    public ResponseEntity<Page<AdminArticleResponseDto>> getArticles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "publishedAt") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(direction), sortBy);
        Page<AdminArticleResponseDto> articles = articleRepository.findAll(pageable).map(this::mapToAdminDto);
        return ResponseEntity.ok(articles);
    }

    @PutMapping("/{id}/feature")
    public ResponseEntity<AdminArticleResponseDto> featureArticle(@PathVariable("id") Long id, @RequestParam("featured") boolean featured) {
        Article article = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        article.setFeatured(featured);
        return ResponseEntity.ok(mapToAdminDto(articleRepository.save(article)));
    }

    @PutMapping("/{id}/hide")
    public ResponseEntity<AdminArticleResponseDto> hideArticle(@PathVariable("id") Long id, @RequestParam("hidden") boolean hidden) {
        Article article = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        article.setHidden(hidden);
        return ResponseEntity.ok(mapToAdminDto(articleRepository.save(article)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable("id") Long id) {
        articleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private AdminArticleResponseDto mapToAdminDto(Article article) {
        return new AdminArticleResponseDto(
            article.getId(),
            article.getTitle(),
            article.getSource() != null ? article.getSource().getName() : "Unknown",
            String.valueOf(article.getCategoryId()),
            article.getAuthor(),
            article.getPublishedAt(),
            article.getSummary(),
            article.getSentiment(),
            article.getSentimentScore(),
            article.isFeatured(),
            article.isHidden()
        );
    }
}
