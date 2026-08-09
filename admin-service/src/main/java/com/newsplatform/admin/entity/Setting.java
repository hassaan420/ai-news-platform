package com.newsplatform.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "settings")
public class Setting {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "setting_key", nullable = false, unique = true, length = 150)
  private String settingKey;

  @Column(name = "setting_value", length = 2000)
  private String settingValue;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public Setting() {}

  public Setting(String settingKey, String settingValue) {
    this.settingKey = settingKey;
    this.settingValue = settingValue;
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }

  // Getters and setters

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getSettingKey() { return settingKey; }
  public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

  public String getSettingValue() { return settingValue; }
  public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

  public Instant getCreatedAt() { return createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
}
