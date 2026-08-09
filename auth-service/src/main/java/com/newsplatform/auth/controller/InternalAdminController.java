package com.newsplatform.auth.controller;

import com.newsplatform.auth.dto.response.AdminUserResponseDto;
import com.newsplatform.auth.entity.User;
import com.newsplatform.auth.model.Role;
import com.newsplatform.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/internal/users")
public class InternalAdminController {

    private final UserRepository userRepository;

    public InternalAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public java.util.Map<String, Object> getUserStats() {
        return java.util.Map.of(
            "total", userRepository.count(),
            "activeToday", 0
        );
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDto>> getAllUsers() {
        List<AdminUserResponseDto> users = userRepository.findAll().stream()
            .map(this::mapToAdminDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AdminUserResponseDto> updateUserRole(@PathVariable Long id, @RequestParam("role") Role role) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return ResponseEntity.ok(mapToAdminDto(userRepository.save(user)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserResponseDto> updateUserStatus(@PathVariable Long id, @RequestParam("enabled") boolean enabled) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        return ResponseEntity.ok(mapToAdminDto(userRepository.save(user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdminUserResponseDto> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeleted(true);
        user.setEnabled(false);
        return ResponseEntity.ok(mapToAdminDto(userRepository.save(user)));
    }

    private AdminUserResponseDto mapToAdminDto(User user) {
        return new AdminUserResponseDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled(),
            user.isDeleted(),
            user.getCreatedAt()
        );
    }
}
