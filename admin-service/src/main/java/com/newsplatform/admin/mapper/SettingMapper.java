package com.newsplatform.admin.mapper;

import com.newsplatform.admin.dto.SettingDto;
import com.newsplatform.admin.entity.Setting;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE, unmappedSourcePolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface SettingMapper {
    SettingDto toDto(Setting setting);
    Setting toEntity(SettingDto settingDto);
}
