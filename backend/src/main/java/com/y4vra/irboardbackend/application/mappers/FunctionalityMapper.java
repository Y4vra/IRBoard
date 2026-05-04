package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class FunctionalityMapper {

    public FunctionalityDTO toDto(Functionality functionality) {
        if (functionality == null) return null;

        return new FunctionalityDTO(
        functionality.getId(),
        functionality.getName(),
        functionality.getDescription(),
        functionality.getLabel(),
        functionality.getState().toString(),
        functionality.getProject().getId(),
        List.of()
        );

    }

    public Functionality toEntity(FunctionalityDTO dto) {
        if (dto == null) return null;

        Functionality functionality = new Functionality();
        functionality.setId(dto.id());
        functionality.setName(dto.name());
        functionality.setDescription(dto.description());
        functionality.setLabel(dto.label());
        functionality.setState(EntityState.valueOf(dto.state()));

        return functionality;
    }

    public FunctionalityDTO toDtoWithRequirements(
            Functionality functionality,
            List<FunctionalRequirementDTO> requirements) {
        if (functionality == null) return null;
        return new FunctionalityDTO(
                functionality.getId(),
                functionality.getName(),
                functionality.getDescription(),
                functionality.getLabel(),
                functionality.getState().toString(),
                functionality.getProject().getId(),
                requirements
        );
    }

    public List<FunctionalityDTO> toDtoListWithRequirements(
            List<Functionality> functionalities,
            Map<Long, List<FunctionalRequirementDTO>> requirementsByFunctionalityId) {
        return functionalities.stream()
                .map(f -> toDtoWithRequirements(
                        f,
                        requirementsByFunctionalityId.getOrDefault(f.getId(), List.of())
                ))
                .filter(dto -> !dto.requirements().isEmpty())
                .toList();
    }
}