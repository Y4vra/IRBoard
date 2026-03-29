package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import org.springframework.stereotype.Component;

@Component
public class NonFunctionalRequirementMapper {

    public NonFunctionalRequirementDTO toDto(NonFunctionalRequirement entity) {
        if (entity == null) return null;

        NonFunctionalRequirementDTO dto = new NonFunctionalRequirementDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setMeasurementUnit(entity.getMeasurementUnit());
        dto.setOperator(entity.getOperator().toString());
        dto.setThresholdValue(entity.getThresholdValue());
        dto.setTargetValue(entity.getTargetValue());
        dto.setActualValue(entity.getActualValue());
        dto.setProjectId(entity.getProject().getId());

        return dto;
    }

    public NonFunctionalRequirement toEntity(NonFunctionalRequirementDTO dto) {
        if (dto == null) return null;

        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setMeasurementUnit(dto.getMeasurementUnit());
        entity.setOperator(ComparisonOperator.valueOf(dto.getOperator()));
        entity.setThresholdValue(dto.getThresholdValue());
        entity.setTargetValue(dto.getTargetValue());
        entity.setActualValue(dto.getActualValue());

        return entity;
    }
}