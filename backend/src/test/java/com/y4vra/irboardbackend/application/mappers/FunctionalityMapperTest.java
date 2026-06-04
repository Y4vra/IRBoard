package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FunctionalityMapperTest {

    private FunctionalityMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new FunctionalityMapper();
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
        FunctionalityDTO dto = new FunctionalityDTO(2L, "identifier", "Authentication", "description", "AU", "DEACTIVATED", 5L,List.of());

        Functionality entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(2L);
        assertThat(entity.getName()).isEqualTo("Authentication");
        assertThat(entity.getLabel()).isEqualTo("AU");
        assertThat(entity.getState()).isEqualTo(FunctionalityState.DEACTIVATED);
    }

    @Test
    void toEntity_throwsWhenStateIsInvalid() {
        FunctionalityDTO dto = new FunctionalityDTO(1L, "identifier", "Name","description", "NM", "INVALID_STATE", 1L, List.of());

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> mapper.toEntity(dto)
        );
    }
    // ── label generation fallback ───────────────────────────────────────────────

    @Test
    void toEntity_generatesLabel_whenLabelIsBlank() {
        FunctionalityDTO dto =
                new FunctionalityDTO(1L, "identifier", "User Management", "desc", "   ", "ACTIVE", 1L, List.of());

        Functionality entity = mapper.toEntity(dto);

        assertThat(entity.getLabel()).isEqualTo("UM");
    }

    @Test
    void toEntity_generatesLabel_singleWordUsesFirstThreeLetters() {
        FunctionalityDTO dto =
                new FunctionalityDTO(1L, "identifier", "Login", "desc", "", "ACTIVE", 1L, List.of());

        Functionality entity = mapper.toEntity(dto);

        assertThat(entity.getLabel()).isEqualTo("LOG");
    }

    @Test
    void toEntity_throwsWhenNameIsBlankAndLabelMissing() {
        FunctionalityDTO dto =
                new FunctionalityDTO(1L, "identifier", "   ", "desc", "", "ACTIVE", 1L, List.of());

        assertThatThrownBy(() -> mapper.toEntity(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }

// ── toDtoWithRequirements ─────────────────────────────────────────────────

    @Test
    void toDtoWithRequirements_mapsCorrectly() {
        Project project = new Project();
        project.setId(99L);

        Functionality f = new Functionality();
        f.setId(10L);
        f.setName("Auth");
        f.setDescription("desc");
        f.setLabel("AU");
        f.setState(FunctionalityState.ACTIVE);
        f.setProject(project);

        FunctionalityDTO dto = mapper.toDtoWithRequirements(f, List.of());

        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.name()).isEqualTo("Auth");
        assertThat(dto.label()).isEqualTo("AU");
        assertThat(dto.state()).isEqualTo("ACTIVE");
        assertThat(dto.projectId()).isEqualTo(99L);
        assertThat(dto.requirements()).isEmpty();
    }

    @Test
    void toDtoWithRequirements_returnsNull_whenEntityNull() {
        assertThat(mapper.toDtoWithRequirements(null, List.of())).isNull();
    }

// ── toDtoListWithRequirements filtering ────────────────────────────────────

    @Test
    void toDtoListWithRequirements_filtersEmptyRequirements() {
        Functionality f1 = new Functionality();
        f1.setId(1L);
        f1.setName("A");
        f1.setState(FunctionalityState.ACTIVE);
        f1.setProject(new Project());

        Functionality f2 = new Functionality();
        f2.setId(2L);
        f2.setName("B");
        f2.setState(FunctionalityState.ACTIVE);
        f2.setProject(new Project());

        Map<Long, List<FunctionalRequirementDTO>> map = Map.of(
                1L, List.of(new FunctionalRequirementDTO(
                        1L,
                        "FR-001",
                        "User can log in",
                        "Allows users to authenticate using email and password",
                        "HIGH",
                        "STABLE",
                        10L,
                        null,
                        1L,
                        "ACTIVE",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of())),
                2L, List.of() // empty -> should be filtered out
        );

        List<FunctionalityDTO> result =
                mapper.toDtoListWithRequirements(List.of(f1, f2), map);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
    }

// ── patchEntity ───────────────────────────────────────────────────────────

    @Test
    void patchEntity_updatesOnlyNonBlankFields() {
        Functionality entity = new Functionality();
        entity.setName("Old");
        entity.setDescription("Old desc");
        entity.setLabel("OLD");

        FunctionalityDTO patch =
                new FunctionalityDTO(null, null, "New Name", "   ", "NEW", null, null, List.of());

        mapper.patchEntity(patch, entity);

        assertThat(entity.getName()).isEqualTo("New Name");
        assertThat(entity.getDescription()).isEqualTo("Old desc"); // unchanged
        assertThat(entity.getLabel()).isEqualTo("NEW");
    }
}
