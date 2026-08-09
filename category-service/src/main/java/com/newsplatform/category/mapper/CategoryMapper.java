package com.newsplatform.category.mapper;

import com.newsplatform.category.dto.CategoryDto;
import com.newsplatform.category.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CategoryMapper {
    CategoryDto toDto(Category category);
    
    @org.mapstruct.Mapping(target = "id", ignore = true)
    @org.mapstruct.Mapping(target = "createdAt", ignore = true)
    @org.mapstruct.Mapping(target = "updatedAt", ignore = true)
    Category toEntity(com.newsplatform.category.dto.CategoryRequest request);
    
    Category toEntity(CategoryDto categoryDto);
}
