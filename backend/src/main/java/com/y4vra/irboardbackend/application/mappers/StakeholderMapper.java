package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.springframework.stereotype.Component;

@Component
public class StakeholderMapper {

    private UserMapper userMapper = new UserMapper();

    public StakeholderMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public StakeholderDTO toDto(Stakeholder stakeholder) {
        if (stakeholder == null) return null;

        return new StakeholderDTO(
            stakeholder.getId(),
            stakeholder.getName(),
            stakeholder.getDescription(),
            stakeholder.getState().name(),
            stakeholder.getProject().getId(),
            userMapper.toDto(stakeholder.getModifyingUser()),
            stakeholder.getStartModificationDate(),
            stakeholder.isLocked()
        );
    }

    public Stakeholder toEntity(StakeholderDTO dto) {
        if (dto == null) return null;

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(dto.id());
        stakeholder.setName(dto.name());
        stakeholder.setDescription(dto.description());
        stakeholder.setState(EntityState.valueOf(dto.state()));
        stakeholder.setModifyingUser(userMapper.toEntity(dto.modificatingUser()));
        stakeholder.setStartModificationDate(dto.startModificationDate());

        return stakeholder;
    }
}