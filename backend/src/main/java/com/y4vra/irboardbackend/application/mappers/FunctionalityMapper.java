package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import org.springframework.stereotype.Component;

@Component
public class FunctionalityMapper {

    public FunctionalityDTO toDto(Functionality functionality) {
        if (functionality == null) return null;

        FunctionalityDTO dto = new FunctionalityDTO();
        dto.setId(functionality.getId());
        dto.setName(functionality.getName());
        dto.setLabel(functionality.getLabel());
        dto.setState(functionality.getState().toString());
        dto.setProjectId(functionality.getProject().getId());

        return dto;
    }

    public Functionality toEntity(FunctionalityDTO dto) {
        if (dto == null) return null;

        Functionality functionality = new Functionality();
        functionality.setId(dto.getId());
        functionality.setName(dto.getName());
        functionality.setLabel(dto.getLabel());
        functionality.setState(FunctionalityState.valueOf(dto.getState()));

        return functionality;
    }
}