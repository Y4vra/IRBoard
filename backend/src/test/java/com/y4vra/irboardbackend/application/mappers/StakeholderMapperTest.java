package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StakeholderMapperTest {

    private StakeholderMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new StakeholderMapper();
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFields() {
        Project project = new Project();
        project.setId(1L);

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setId(5L);
        stakeholder.setName("End User");
        stakeholder.setDescription("Primary system user");
        stakeholder.setState(EntityState.ACTIVE);
        stakeholder.setProject(project);

        StakeholderDTO dto = mapper.toDto(stakeholder);

        assertThat(dto.id()).isEqualTo(5L);
        assertThat(dto.name()).isEqualTo("End User");
        assertThat(dto.description()).isEqualTo("Primary system user");
        assertThat(dto.projectId()).isEqualTo(1L);
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        StakeholderDTO dto = new StakeholderDTO(3L, "Admin", "System administrator", EntityState.ACTIVE.name(), 2L);

        Stakeholder entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(3L);
        assertThat(entity.getName()).isEqualTo("Admin");
        assertThat(entity.getDescription()).isEqualTo("System administrator");
    }
}
