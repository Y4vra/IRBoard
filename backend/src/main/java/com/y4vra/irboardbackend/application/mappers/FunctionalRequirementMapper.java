package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import org.springframework.stereotype.Component;

@Component
public class FunctionalRequirementMapper {

    private final UserMapper userMapper;

    public FunctionalRequirementMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public FunctionalRequirementDTO toDto(FunctionalRequirement entity) {
        if (entity == null) return null;

        Long functionalityId = null;
        Long projectId = null;

        if (entity.getFunctionality() != null) {
            functionalityId = entity.getFunctionality().getId();
            if (entity.getFunctionality().getProject() != null) {
                projectId = entity.getFunctionality().getProject().getId();
            }
        }

        return new FunctionalRequirementDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPriority(),
                entity.getStability(),
                functionalityId,
                projectId,
                userMapper.toDto(entity.getModifyingUser()),
                entity.getStartModificationDate(),
                entity.isLocked()
        );
    }

    public FunctionalRequirement toEntity(FunctionalRequirementDTO dto) {
        if (dto == null) return null;

        FunctionalRequirement entity = new FunctionalRequirement();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setPriority(dto.priority());
        entity.setStability(dto.stability());
        entity.setModifyingUser(userMapper.toEntity(dto.modificatingUser()));
        entity.setStartModificationDate(dto.startModificationDate());

        return entity;
    }
}