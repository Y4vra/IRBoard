package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private UserMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new UserMapper();
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFields() {
        User user = new User();
        user.setId(1L);
        user.setEmail("javier@example.com");
        user.setName("Javier");
        user.setSurname("Carrasco");
        user.setActive(true);
        user.setIsAdmin(false);

        UserDTO dto = mapper.toDto(user);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.email()).isEqualTo("javier@example.com");
        assertThat(dto.name()).isEqualTo("Javier");
        assertThat(dto.surname()).isEqualTo("Carrasco");
        assertThat(dto.active()).isTrue();
        assertThat(dto.isAdmin()).isFalse();
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        UserDTO dto = new UserDTO(2L, "admin@example.com", "Admin", "User", true, true,null,null,false);

        User entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(2L);
        assertThat(entity.getEmail()).isEqualTo("admin@example.com");
        assertThat(entity.getName()).isEqualTo("Admin");
        assertThat(entity.getSurname()).isEqualTo("User");
        assertThat(entity.getActive()).isTrue();
        assertThat(entity.getIsAdmin()).isTrue();
    }
}
