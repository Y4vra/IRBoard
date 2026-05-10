package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class UserMapper {

    public UserDTO toDto(User user) {
        return toDtoWithPermissions(user,null,null,null);
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.id());
        user.setEmail(dto.email());
        user.setName(dto.name());
        user.setSurname(dto.surname());
        user.setActive(dto.active());
        user.setIsAdmin(dto.isAdmin());

        return user;
    }

    public void patchEntity(UserDTO dto, User entity) {
        if (dto.name() != null && !dto.name().isBlank()) entity.setName(dto.name());
        if (dto.email() != null && !dto.email().isBlank()) entity.setEmail(dto.email());
        if (dto.surname() != null && !dto.surname().isBlank()) entity.setSurname(dto.surname());
        if (dto.active() != null) entity.setActive(dto.active());
        if (dto.isAdmin() != null) entity.setIsAdmin(dto.isAdmin());
    }

    public UserDTO toDtoWithPermissions(User user, List<String> projectsWhereUserIsManager, Map<Long, List<String>> functionalitiesWhereUserIsEngineer, Map<Long, List<String>> functionalitiesWhereUserIsStakeholder) {
        if (user == null) return null;

        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname(),
                user.getActive(),
                user.getIsAdmin(),
                projectsWhereUserIsManager,
                functionalitiesWhereUserIsEngineer,
                functionalitiesWhereUserIsStakeholder
        );
    }
}