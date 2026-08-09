package com.newsplatform.admin.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 190)
    private String actor;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    public AuditLog() {}

    public AuditLog(String actor, String actionType, String entityType, String entityId, String description) {
        this.actor = actor;
        this.actionType = actionType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = Instant.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
