package com.newsplatform.news.mapper;

import com.newsplatform.news.dto.*;
import com.newsplatform.news.entity.Article;
import com.newsplatform.news.entity.FetchLog;
import com.newsplatform.news.entity.Source;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface NewsMapper {

    SourceDto toDto(Source source);

    @Mapping(target = "apiKey", ignore = true) // Not exposed in DTO
    @Mapping(target = "createdAt", ignore = true) // Handled by JPA
    @Mapping(target = "updatedAt", ignore = true) // Handled by JPA
    Source toEntity(SourceDto sourceDto);

    @Mapping(target = "relatedArticles", ignore = true)
    @Mapping(target = "keywords", source = "keywords")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "views", source = "stats.views")
    @Mapping(target = "bookmarks", source = "stats.bookmarks")
    NewsResponse toNewsResponse(Article article);

    @Mapping(target = "keywords", source = "keywords")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "views", source = "stats.views")
    @Mapping(target = "bookmarks", source = "stats.bookmarks")
    NewsSummaryResponse toNewsSummaryResponse(Article article);

    @Mapping(target = "searchScore", ignore = true)
    NewsSearchResponse toNewsSearchResponse(Article article);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "source", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "summary", ignore = true)
    @Mapping(target = "sentiment", ignore = true)
    @Mapping(target = "sentimentScore", ignore = true)
    Article toEntity(NewsRequest request);

    @Mapping(target = "category", ignore = true) // Set manually by service using categoryId
    ArticleSummaryDto toSummaryDto(Article article);

    @Mapping(target = "category", ignore = true) // Set manually by service using categoryId
    @Mapping(target = "relatedArticles", ignore = true) // Set manually by service
    ArticleDto toDto(Article article);

    @Mapping(target = "sourceId", source = "source.id")
    FetchLogDto toDto(FetchLog fetchLog);

    default java.util.List<String> mapKeywords(java.util.List<com.newsplatform.news.entity.ArticleKeyword> keywords) {
        if (keywords == null) return java.util.Collections.emptyList();
        return keywords.stream().map(com.newsplatform.news.entity.ArticleKeyword::getKeyword).collect(java.util.stream.Collectors.toList());
    }

    default java.util.List<String> mapTags(java.util.List<com.newsplatform.news.entity.ArticleTag> tags) {
        if (tags == null) return java.util.Collections.emptyList();
        return tags.stream().map(com.newsplatform.news.entity.ArticleTag::getTag).collect(java.util.stream.Collectors.toList());
    }
}
