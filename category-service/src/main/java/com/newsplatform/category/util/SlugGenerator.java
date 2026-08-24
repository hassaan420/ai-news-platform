package com.newsplatform.category.util;

import com.newsplatform.category.repository.CategoryRepository;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class SlugGenerator {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");

    private final CategoryRepository categoryRepository;

    public SlugGenerator(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Input string cannot be null or empty");
        }

        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = EDGESDHASHES.matcher(slug).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH);

        String finalSlug = slug;
        int count = 1;
        while (categoryRepository.existsBySlug(finalSlug)) {
            count++;
            finalSlug = slug + "-" + count;
        }

        return finalSlug;
    }
}
