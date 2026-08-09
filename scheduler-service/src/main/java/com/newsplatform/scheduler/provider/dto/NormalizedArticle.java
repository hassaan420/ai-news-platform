package com.newsplatform.scheduler.provider.dto;

public class NormalizedArticle {
    private String title;
    private String description;
    private String content;
    private String url;
    private String image;
    private String author;
    private Long sourceId;
    private Long categoryId;
    private String language;
    private String publishedAt;
    private String hash;

    public NormalizedArticle() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getPublishedAt() { return publishedAt; }
    public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
}
