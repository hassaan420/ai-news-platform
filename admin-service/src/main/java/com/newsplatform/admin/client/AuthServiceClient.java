package com.newsplatform.admin.client;

import com.newsplatform.admin.dto.AdminUserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service", url = "${feign.client.auth-service.url:http://auth-service:8081}")
public interface AuthServiceClient {

    @GetMapping("/internal/users/stats")
    Map<String, Object> getUserStats();

    @GetMapping("/internal/users")
    List<AdminUserDto> getAllUsers();

    @PutMapping("/internal/users/{id}/role")
    AdminUserDto updateUserRole(@PathVariable("id") Long id, @RequestParam("role") String role);

    @PutMapping("/internal/users/{id}/status")
    AdminUserDto updateUserStatus(@PathVariable("id") Long id, @RequestParam("enabled") boolean enabled);

    @DeleteMapping("/internal/users/{id}")
    AdminUserDto deleteUser(@PathVariable("id") Long id);
}
