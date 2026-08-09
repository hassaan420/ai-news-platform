package com.newsplatform.news.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "article_keywords")
public class ArticleKeyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(nullable = false, length = 100)
    private String keyword;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}
