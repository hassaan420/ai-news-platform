package com.newsplatform.admin.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "error_logs")
public class ErrorLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;

    @Column(nullable = false, length = 50)
    private String severity;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    public ErrorLog() {}

    @PrePersist
    protected void onCreate() {
        this.timestamp = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
