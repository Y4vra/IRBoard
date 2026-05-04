package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class StakeholderMapper {

    public StakeholderDTO toDto(Stakeholder stakeholder) {
        if (stakeholder == null) return null;

        return new StakeholderDTO(
            stakeholder.getId(),
            stakeholder.getName(),
            stakeholder.getDescription(),
            stakeholder.getState().name(),
            stakeholder.getProject().getId(),
            List.of()
        );
    }
    public StakeholderDTO toDtoWithObservers(Stakeholder stakeholder, List<Requirement> observers) {
        if (stakeholder == null) return null;

        return new StakeholderDTO(
            stakeholder.getId(),
            stakeholder.getName(),
            stakeholder.getDescription(),
            stakeholder.getState().name(),
            stakeholder.getProject().getId(),
            SummaryMapper.toRequirementSummaries(observers)
        );
    }

    public Stakeholder toEntity(StakeholderDTO dto) {
        if (dto == null) return null;

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(dto.id());
        stakeholder.setName(dto.name());
        stakeholder.setDescription(dto.description());
        stakeholder.setState(EntityState.valueOf(dto.state()));

        return stakeholder;
    }

    public List<StakeholderDTO> toDtoList(List<Stakeholder> stkhs) {
        return stkhs.stream().map(this::toDto).collect(Collectors.toList());
    }
}