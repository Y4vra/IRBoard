package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.springframework.stereotype.Component;

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
        functionality.getProject().getId()
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
}