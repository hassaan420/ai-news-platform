package com.newsplatform.scheduler.provider.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MediastackResponse {
    private List<Article> data;

    public List<Article> getData() { return data; }
    public void setData(List<Article> data) { this.data = data; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Article {
        private String title;
        private String description;
        private String url;
        private String image;
        @JsonProperty("published_at")
        private String publishedAt;
        private String author;
        private String source;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }

        public String getPublishedAt() { return publishedAt; }
        public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
    }
}
