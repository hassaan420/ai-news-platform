package com.newsplatform.category;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.newsplatform"})
public class CategoryServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(CategoryServiceApplication.class, args);
  }
}
