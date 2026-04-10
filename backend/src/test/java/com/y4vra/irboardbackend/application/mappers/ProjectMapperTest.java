package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectMapperTest {

    private ProjectMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ProjectMapper();
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFields() {
        Project project = new Project("IR-Board", "A requirements board", "TERNARY");
        project.setId(1L);

        ProjectDTO dto = mapper.toDto(project);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.name()).isEqualTo("IR-Board");
        assertThat(dto.description()).isEqualTo("A requirements board");
        assertThat(dto.priorityStyle()).isEqualTo("TERNARY");
        assertThat(dto.state()).isEqualTo("ACTIVE");
        assertThat(dto.requirementCount()).isEqualTo(0);
    }

    @Test
    void toDto_handlesNullPriorityStyleAndState() {
        Project project = new Project();
        project.setId(2L);
        project.setName("Empty");
        project.setDescription("desc");

        ProjectDTO dto = mapper.toDto(project);

        assertThat(dto.priorityStyle()).isNull();
        assertThat(dto.state()).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        ProjectDTO dto = new ProjectDTO(5L, "My Project", "desc", "MOSCOW", "FINISHED", 0);

        Project project = mapper.toEntity(dto);

        assertThat(project.getId()).isEqualTo(5L);
        assertThat(project.getName()).isEqualTo("My Project");
        assertThat(project.getDescription()).isEqualTo("desc");
        assertThat(project.getPriorityStyle()).isEqualTo(PriorityStyle.MOSCOW);
        assertThat(project.getState()).isEqualTo(ProjectState.FINISHED);
    }
}
