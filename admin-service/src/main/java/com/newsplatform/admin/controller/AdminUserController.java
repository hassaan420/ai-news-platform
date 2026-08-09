package com.newsplatform.admin.controller;

import com.newsplatform.admin.client.AuthServiceClient;
import com.newsplatform.admin.dto.AdminUserDto;
import com.newsplatform.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin User Management API")
public class AdminUserController {

    private final AuthServiceClient authServiceClient;
    private final AuditLogService auditLogService;

    public AdminUserController(AuthServiceClient authServiceClient, AuditLogService auditLogService) {
        this.authServiceClient = authServiceClient;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(authServiceClient.getAllUsers());
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<AdminUserDto> updateUserRole(@PathVariable Long id, @RequestParam("role") String role) {
        AdminUserDto user = authServiceClient.updateUserRole(id, role);
        auditLogService.logAction("UPDATE_ROLE", "User", String.valueOf(id), "Changed role to " + role);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Enable/disable user")
    public ResponseEntity<AdminUserDto> updateUserStatus(@PathVariable Long id, @RequestParam("enabled") boolean enabled) {
        AdminUserDto user = authServiceClient.updateUserStatus(id, enabled);
        auditLogService.logAction("UPDATE_STATUS", "User", String.valueOf(id), "Set enabled to " + enabled);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft-delete) user")
    public ResponseEntity<AdminUserDto> deleteUser(@PathVariable Long id) {
        AdminUserDto user = authServiceClient.deleteUser(id);
        auditLogService.logAction("DELETE", "User", String.valueOf(id), "Soft deleted user");
        return ResponseEntity.ok(user);
    }
}
