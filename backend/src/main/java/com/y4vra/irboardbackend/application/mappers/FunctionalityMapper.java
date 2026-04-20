package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import org.springframework.stereotype.Component;

@Component
public class FunctionalityMapper {

    private UserMapper userMapper = new UserMapper();

    public FunctionalityMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public FunctionalityDTO toDto(Functionality functionality) {
        if (functionality == null) return null;

        return new FunctionalityDTO(
        functionality.getId(),
        functionality.getName(),
        functionality.getLabel(),
        functionality.getState().toString(),
        functionality.getProject().getId(),
        userMapper.toDto(functionality.getModifyingUser()),
        functionality.getStartModificationDate(),
        functionality.isLocked()
        );

    }

    public Functionality toEntity(FunctionalityDTO dto) {
        if (dto == null) return null;

        Functionality functionality = new Functionality();
        functionality.setId(dto.id());
        functionality.setName(dto.name());
        functionality.setLabel(dto.label());
        functionality.setState(FunctionalityState.valueOf(dto.state()));
        functionality.setModifyingUser(userMapper.toEntity(dto.modificatingUser()));
        functionality.setStartModificationDate(dto.startModificationDate());

        return functionality;
    }
}