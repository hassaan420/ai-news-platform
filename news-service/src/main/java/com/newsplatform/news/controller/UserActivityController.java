package com.newsplatform.news.controller;

import com.newsplatform.news.dto.ReadingCountResponse;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.UserReadingHistory;
import com.newsplatform.news.repository.ArticleRepository;
import com.newsplatform.news.repository.UserReadingHistoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/news/me")
@Tag(name = "User Activity API", description = "Endpoints for managing current user activity and stats")
public class UserActivityController {

    private final UserReadingHistoryRepository historyRepository;
    private final ArticleRepository articleRepository;

    public UserActivityController(UserReadingHistoryRepository historyRepository, ArticleRepository articleRepository) {
        this.historyRepository = historyRepository;
        this.articleRepository = articleRepository;
    }

    @GetMapping("/reading-count")
    @Operation(summary = "Get current user's reading count")
    public ResponseEntity<ReadingCountResponse> getReadingCount() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        long count = historyRepository.countByUserId(userId);
        return ResponseEntity.ok(new ReadingCountResponse(count));
    }

    @PostMapping("/history/{articleId}")
    @Operation(summary = "Record that the current user read an article")
    public ResponseEntity<Void> recordArticleRead(@PathVariable("articleId") Long articleId) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<Article> articleOpt = articleRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UserReadingHistory history = new UserReadingHistory();
        history.setUserId(userId);
        history.setArticle(articleOpt.get());
        history.setReadAt(Instant.now());
        historyRepository.save(history);

        return ResponseEntity.ok().build();
    }

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser") || auth.getName().equals("internal-service")) {
            return null;
        }
        return auth.getName();
    }
}
