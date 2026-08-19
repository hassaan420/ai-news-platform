package com.newsplatform.category;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = {"com.newsplatform"})
@EnableCaching
public class CategoryServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(CategoryServiceApplication.class, args);
  }
}
