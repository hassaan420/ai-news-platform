package com.newsplatform.news.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "article_tags")
public class ArticleTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(nullable = false, length = 100)
    private String tag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Article getArticle() { return article; }
    public void setArticle(Article article) { this.article = article; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
}
