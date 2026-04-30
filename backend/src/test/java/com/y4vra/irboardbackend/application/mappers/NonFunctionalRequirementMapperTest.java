package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NonFunctionalRequirementMapperTest {

    private NonFunctionalRequirementMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new NonFunctionalRequirementMapper();
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
        assertThat(dto.projectId()).isEqualTo(2L);
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        NonFunctionalRequirementDTO dto = new NonFunctionalRequirementDTO(
                9L, "Availability", "Must be highly available", RequirementState.PENDING_APPROVAL.name(),"percent",
                "GREATER_THAN", 99.0, 99.9, 99.5, 1L, null, null
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
                1L, "Name", "desc", RequirementState.PENDING_APPROVAL.name(), "ms", "NOT_AN_OPERATOR",
                1.0, 2.0, 1.5, 1L,null, null
        );

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> mapper.toEntity(dto)
        );
    }
}
