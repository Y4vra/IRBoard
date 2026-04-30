package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class NonFunctionalRequirementMapper {

    public NonFunctionalRequirementDTO toDto(NonFunctionalRequirement entity) {
        if (entity == null) return null;

        Long projectId = null;
        Long parentId = null;

        if (entity.getProject() != null) {
            projectId = entity.getProject().getId();
        }
        if (entity.getParent() != null) {
            parentId = entity.getParent().getId();
        }

        List<NonFunctionalRequirementDTO> childDtos = entity.getChildren().stream()
                .filter(child -> child instanceof NonFunctionalRequirement)
                .map(child -> toDto((NonFunctionalRequirement) child))
                .sorted(Comparator.comparing(
                        NonFunctionalRequirementDTO::id,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();

        return new NonFunctionalRequirementDTO(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getState().name(),
            entity.getMeasurementUnit(),
            entity.getOperator().toString(),
            entity.getThresholdValue(),
            entity.getTargetValue(),
            entity.getActualValue(),
            projectId,
            parentId,
            childDtos
        );
    }

    public NonFunctionalRequirement toEntity(NonFunctionalRequirementDTO dto) {
        if (dto == null) return null;

        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setState(dto.state() != null ? RequirementState.valueOf(dto.state()) : null);
        entity.setMeasurementUnit(dto.measurementUnit());
        entity.setOperator(dto.operator() != null ? ComparisonOperator.valueOf(dto.operator()) : null);
        entity.setThresholdValue(dto.thresholdValue());
        entity.setTargetValue(dto.targetValue());
        entity.setActualValue(dto.actualValue());

        return entity;
    }
}