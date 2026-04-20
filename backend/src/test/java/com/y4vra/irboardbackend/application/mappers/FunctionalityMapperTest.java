package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FunctionalityMapperTest {

    private FunctionalityMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new FunctionalityMapper(new UserMapper());
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFields() {
        Project project = new Project();
        project.setId(10L);

        Functionality functionality = new Functionality();
        functionality.setId(1L);
        functionality.setName("User Management");
        functionality.setLabel("UM");
        functionality.setState(FunctionalityState.ACTIVE);
        functionality.setProject(project);

        FunctionalityDTO dto = mapper.toDto(functionality);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.name()).isEqualTo("User Management");
        assertThat(dto.label()).isEqualTo("UM");
        assertThat(dto.state()).isEqualTo("ACTIVE");
        assertThat(dto.projectId()).isEqualTo(10L);
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        FunctionalityDTO dto = new FunctionalityDTO(2L, "Authentication", "AU", "DEACTIVATED", 5L,null,null,false);

        Functionality entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(2L);
        assertThat(entity.getName()).isEqualTo("Authentication");
        assertThat(entity.getLabel()).isEqualTo("AU");
        assertThat(entity.getState()).isEqualTo(FunctionalityState.DEACTIVATED);
    }

    @Test
    void toEntity_throwsWhenStateIsInvalid() {
        FunctionalityDTO dto = new FunctionalityDTO(1L, "Name", "NM", "INVALID_STATE", 1L,null,null,false);

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> mapper.toEntity(dto)
        );
    }
}
