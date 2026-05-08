package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
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
        if (dto.label() != null && !dto.label().isBlank()) {
            functionality.setLabel(dto.label());
        } else {
            functionality.setLabel(generateLabel(dto.name()));
        }
        if(dto.state() != null && !dto.state().isBlank()) {
            functionality.setState(FunctionalityState.valueOf(dto.state()));
        }

        return functionality;
    }
    private String generateLabel(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Cannot generate label for empty name");
        }

        String[] words = name.trim().split("\\s+");
        StringBuilder label = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                label.append(Character.toUpperCase(word.charAt(0)));
            }
        }

        if (words.length == 1 && name.length() >= 3) {
            return name.substring(0, 3).toUpperCase();
        }

        return label.toString();
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

    public void patchEntity(FunctionalityDTO patch, Functionality functionality) {
        if(patch.name() !=null && !patch.name().isBlank()) functionality.setName(patch.name());
        if(patch.description() != null && !patch.description().isBlank()) functionality.setDescription(patch.description());
        if(patch.label() != null && !patch.label().isBlank()) functionality.setLabel(patch.label());
    }

}