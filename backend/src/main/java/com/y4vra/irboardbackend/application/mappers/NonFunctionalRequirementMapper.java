package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import org.springframework.stereotype.Component;

@Component
public class NonFunctionalRequirementMapper {

    public NonFunctionalRequirementDTO toDto(NonFunctionalRequirement entity) {
        if (entity == null) return null;

        return new NonFunctionalRequirementDTO(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getMeasurementUnit(),
            entity.getOperator().toString(),
            entity.getThresholdValue(),
            entity.getTargetValue(),
            entity.getActualValue(),
            entity.getProject().getId());
    }

    public NonFunctionalRequirement toEntity(NonFunctionalRequirementDTO dto) {
        if (dto == null) return null;

        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setMeasurementUnit(dto.measurementUnit());
        entity.setOperator(ComparisonOperator.valueOf(dto.operator()));
        entity.setThresholdValue(dto.thresholdValue());
        entity.setTargetValue(dto.targetValue());
        entity.setActualValue(dto.actualValue());

        return entity;
    }
}