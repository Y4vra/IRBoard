package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import org.springframework.stereotype.Component;

@Component
public class StakeholderMapper {

    public StakeholderDTO toDto(Stakeholder stakeholder) {
        if (stakeholder == null) return null;

        StakeholderDTO dto = new StakeholderDTO();
        dto.setId(stakeholder.getId());
        dto.setName(stakeholder.getName());
        dto.setDescription(stakeholder.getDescription());
        dto.setProjectId(stakeholder.getProject().getId());

        return dto;
    }

    public Stakeholder toEntity(StakeholderDTO dto) {
        if (dto == null) return null;

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(dto.getId());
        stakeholder.setName(dto.getName());
        stakeholder.setDescription(dto.getDescription());

        return stakeholder;
    }
}