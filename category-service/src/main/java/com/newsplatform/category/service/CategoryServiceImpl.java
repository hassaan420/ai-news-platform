package com.newsplatform.category.service;

import com.newsplatform.category.dto.CategoryDto;
import com.newsplatform.category.dto.CategoryRequest;
import com.newsplatform.common.dto.PagedResponse;
import com.newsplatform.category.entity.Category;
import com.newsplatform.category.mapper.CategoryMapper;
import com.newsplatform.category.repository.CategoryRepository;
import com.newsplatform.common.exception.ConflictException;
import com.newsplatform.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final com.newsplatform.category.util.SlugGenerator slugGenerator;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper, com.newsplatform.category.util.SlugGenerator slugGenerator) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.slugGenerator = slugGenerator;
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toDto(category);
    }

    @Override
    @Cacheable(value = "category_slug", key = "#slug")
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return categoryMapper.toDto(category);
    }

    @Override
    public PagedResponse<CategoryDto> getAllCategories(Pageable pageable) {
        Page<Category> page = categoryRepository.findAll(pageable);
        List<CategoryDto> content = page.getContent().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Cacheable(value = "category_all")
    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findAllByActiveTrue().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> getValidCategoryIds() {
        return categoryRepository.findAllActiveIds();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"category_all", "category_slug"}, allEntries = true)
    public CategoryDto createCategory(CategoryRequest request) {
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = slugGenerator.generateSlug(request.title());
        } else if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Category with slug '" + slug + "' already exists");
        }
        
        Category category = categoryMapper.toEntity(request);
        category.setSlug(slug);
        
        if (request.active() != null) {
            category.setActive(request.active());
        } else {
            category.setActive(true);
        }
        Category saved = categoryRepository.save(category);
        return categoryMapper.toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"category_all", "category_slug"}, allEntries = true)
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            // Don't auto-generate on update if not provided, just keep existing
            slug = category.getSlug();
        }

        if (!category.getSlug().equals(slug) && categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Category with slug '" + slug + "' already exists");
        }

        category.setTitle(request.title());
        category.setSlug(slug);
        category.setIcon(request.icon());
        if (request.active() != null) {
            category.setActive(request.active());
        }

        Category updated = categoryRepository.save(category);
        return categoryMapper.toDto(updated);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"category_all", "category_slug"}, allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
