package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDto(User user) {
        if (user == null) return null;

        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname(),
                user.getActive(),
                user.getIsAdmin(),
                user.getOryId()
        );
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
        user.setOryId(dto.oryId());

        return user;
    }
}