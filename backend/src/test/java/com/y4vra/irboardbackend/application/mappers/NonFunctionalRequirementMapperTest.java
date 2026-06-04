package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.Associations;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NonFunctionalRequirementMapperTest {

    private NonFunctionalRequirementMapper mapper;

    @BeforeEach
    void setUp() {
        StakeholderMapper stakeholderMapper = new StakeholderMapper();
        DocumentMapper documentMapper = new DocumentMapper();
        mapper = new NonFunctionalRequirementMapper();
        mapper.setFrMapper(new FunctionalRequirementMapper(stakeholderMapper,documentMapper,mapper));
        mapper.setStakeholderMapper(stakeholderMapper);
        mapper.setDocumentMapper(documentMapper);
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFields() {
        Project project = new Project();
        project.setId(2L);

        NonFunctionalRequirement nfr = new NonFunctionalRequirement();
        nfr.setId(1L);
        nfr.setName("Response Time");
        nfr.setDescription("API must respond within threshold");
        nfr.setMeasurementUnit("ms");
        nfr.setState(RequirementState.PENDING_APPROVAL);
        nfr.setOperator(ComparisonOperator.LESS_THAN);
        nfr.setThresholdValue(200.0);
        nfr.setTargetValue(100.0);
        nfr.setActualValue(150.0);
        nfr.setProject(project);

        NonFunctionalRequirementDTO dto = mapper.toDto(nfr);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.name()).isEqualTo("Response Time");
        assertThat(dto.description()).isEqualTo("API must respond within threshold");
        assertThat(dto.measurementUnit()).isEqualTo("ms");
        assertThat(dto.operator()).isEqualTo("LESS_THAN");
        assertThat(dto.thresholdValue()).isEqualTo(200.0);
        assertThat(dto.targetValue()).isEqualTo(100.0);
        assertThat(dto.actualValue()).isEqualTo(150.0);
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        NonFunctionalRequirementDTO dto = new NonFunctionalRequirementDTO(
                9L, "identifier", "Availability", "Must be highly available",100L, RequirementState.PENDING_APPROVAL.name(),"percent",
                "GREATER_THAN", 99.0, 99.9, 99.5, 1L, null, null,
                List.of(),List.of(),List.of(),List.of()
        );

        NonFunctionalRequirement entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(9L);
        assertThat(entity.getName()).isEqualTo("Availability");
        assertThat(entity.getDescription()).isEqualTo("Must be highly available");
        assertThat(entity.getMeasurementUnit()).isEqualTo("percent");
        assertThat(entity.getOperator()).isEqualTo(ComparisonOperator.GREATER_THAN);
        assertThat(entity.getThresholdValue()).isEqualTo(99.0);
        assertThat(entity.getTargetValue()).isEqualTo(99.9);
        assertThat(entity.getActualValue()).isEqualTo(99.5);
    }

    @Test
    void toEntity_throwsOnInvalidOperator() {
        NonFunctionalRequirementDTO dto = new NonFunctionalRequirementDTO(
                1L, "identifier", "Name", "desc",100L, RequirementState.PENDING_APPROVAL.name(), "ms", "NOT_AN_OPERATOR",
                1.0, 2.0, 1.5, 1L,null, null,List.of(),List.of(),List.of(),List.of()
        );

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> mapper.toEntity(dto)
        );
    }

// ── toDetailedDto ───────────────────────────────────────────────────────────

    @Test
    void toDetailedDto_returnsNull_whenEntityIsNull() {
        assertThat(
                mapper.toDetailedDto(null, List.of(), List.of(), List.of(), List.of())
        ).isNull();
    }

    @Test
    void toDetailedDto_mapsProjectId_andParentId() {
        Project project = new Project();
        project.setId(10L);

        NonFunctionalRequirement parent = new NonFunctionalRequirement();
        parent.setId(99L);

        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setId(1L);
        entity.setName("NFR");
        entity.setOrderValue(1L);
        entity.setState(RequirementState.PENDING_APPROVAL);
        entity.setOperator(ComparisonOperator.LESS_THAN);
        entity.setProject(project);
        entity.setParent(parent);

        NonFunctionalRequirementDTO dto =
                mapper.toDetailedDto(entity, List.of(), List.of(), List.of(), List.of());

        assertThat(dto.projectId()).isEqualTo(10L);
        assertThat(dto.parentId()).isEqualTo(99L);
    }

    @Test
    void toDetailedDto_sortsChildren_byOrderValue() {
        NonFunctionalRequirement parent = new NonFunctionalRequirement();
        parent.setId(1L);
        parent.setState(RequirementState.APPROVED);
        parent.setOperator(ComparisonOperator.LESS_THAN);

        NonFunctionalRequirement c1 = new NonFunctionalRequirement();
        c1.setId(2L);
        c1.setOrderValue(10L);
        c1.setState(RequirementState.APPROVED);
        c1.setOperator(ComparisonOperator.LESS_THAN);

        NonFunctionalRequirement c2 = new NonFunctionalRequirement();
        c2.setId(3L);
        c2.setOrderValue(1L);
        c2.setState(RequirementState.APPROVED);
        c2.setOperator(ComparisonOperator.LESS_THAN);

        Associations.link(parent, c1);
        Associations.link(parent, c2);

        NonFunctionalRequirementDTO dto =
                mapper.toDetailedDto(parent, List.of(), List.of(), List.of(), List.of());

        assertThat(dto.children())
                .hasSize(2)
                .extracting(NonFunctionalRequirementDTO::orderValue)
                .containsExactly(1L, 10L);
    }

    @Test
    void toDetailedDto_filtersRemovedChildren() {
        NonFunctionalRequirement parent = new NonFunctionalRequirement();
        parent.setId(1L);
        parent.setState(RequirementState.APPROVED);
        parent.setOperator(ComparisonOperator.LESS_THAN);

        NonFunctionalRequirement c1 = new NonFunctionalRequirement();
        c1.setId(2L);
        c1.setOrderValue(1L);
        c1.setState(RequirementState.REMOVED);
        c1.setOperator(ComparisonOperator.LESS_THAN);

        NonFunctionalRequirement c2 = new NonFunctionalRequirement();
        c2.setId(3L);
        c2.setOrderValue(2L);
        c2.setState(RequirementState.APPROVED);
        c2.setOperator(ComparisonOperator.LESS_THAN);

        Associations.link(parent, c1);
        Associations.link(parent, c2);

        NonFunctionalRequirementDTO dto =
                mapper.toDetailedDto(parent, List.of(), List.of(), List.of(), List.of());

        assertThat(dto.children()).hasSize(1);
        assertThat(dto.children().get(0).id()).isEqualTo(3L);
    }

// ── toDtoList ───────────────────────────────────────────────────────────────

    @Test
    void toDtoList_mapsAllElements() {
        NonFunctionalRequirement n1 = new NonFunctionalRequirement();
        n1.setId(1L);
        n1.setName("A");
        n1.setOrderValue(1L);
        n1.setState(RequirementState.APPROVED);
        n1.setOperator(ComparisonOperator.LESS_THAN);

        NonFunctionalRequirement n2 = new NonFunctionalRequirement();
        n2.setId(2L);
        n2.setName("B");
        n2.setOrderValue(2L);
        n2.setState(RequirementState.APPROVED);
        n2.setOperator(ComparisonOperator.LESS_THAN);

        List<NonFunctionalRequirementDTO> result =
                mapper.toDtoList(List.of(n1, n2));

        assertThat(result).hasSize(2);
    }

// ── patchEntity ─────────────────────────────────────────────────────────────

    @Test
    void patchEntity_updatesOnlyProvidedFields() {
        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setName("Old");
        entity.setDescription("Old desc");
        entity.setMeasurementUnit("ms");
        entity.setOperator(ComparisonOperator.LESS_THAN);
        entity.setActualValue(10.0);
        entity.setThresholdValue(100.0);
        entity.setTargetValue(200.0);

        NonFunctionalRequirementDTO patch =
                new NonFunctionalRequirementDTO(
                        null,
                        null,
                        "New",
                        "",
                        1L,
                        RequirementState.APPROVED.name(),
                        "percent",
                        "GREATER_THAN",
                        20.0,
                        100.0,
                        30.0,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                );

        mapper.patchEntity(patch, entity);

        assertThat(entity.getName()).isEqualTo("New");
        assertThat(entity.getMeasurementUnit()).isEqualTo("percent");
        assertThat(entity.getOperator()).isEqualTo(ComparisonOperator.GREATER_THAN);
        assertThat(entity.getThresholdValue()).isEqualTo(20.0);
        assertThat(entity.getTargetValue()).isEqualTo(100.0);
        assertThat(entity.getActualValue()).isEqualTo(30.0);
    }

    @Test
    void patchEntity_handlesNullPatchGracefully() {
        NonFunctionalRequirement entity = new NonFunctionalRequirement();
        entity.setName("Keep");

        mapper.patchEntity(null, entity);

        assertThat(entity.getName()).isEqualTo("Keep");
    }
}
