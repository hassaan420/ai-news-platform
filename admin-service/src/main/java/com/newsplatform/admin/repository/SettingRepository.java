package com.newsplatform.admin.repository;

import com.newsplatform.admin.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Long> {
    Optional<Setting> findBySettingKey(String settingKey);
}
