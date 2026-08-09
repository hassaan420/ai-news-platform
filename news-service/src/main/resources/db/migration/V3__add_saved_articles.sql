CREATE TABLE saved_articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    article_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_saved_article_article FOREIGN KEY (article_id) REFERENCES articles(id),
    UNIQUE KEY uk_saved_article_user_article (user_id, article_id)
);
