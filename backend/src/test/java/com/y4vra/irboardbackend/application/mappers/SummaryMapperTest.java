package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.summaries.FunctionalRequirementSummaryDTO;
import com.y4vra.irboardbackend.application.dtos.summaries.RequirementSummary;
import com.y4vra.irboardbackend.application.dtos.summaries.RequirementSummaryDTO;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SummaryMapperTest {

    @Test
    void shouldMapFunctionalRequirement() {
        FunctionalRequirement fr = mock(FunctionalRequirement.class);
        Functionality functionality = mock(Functionality.class);

        when(fr.getId()).thenReturn(1L);
        when(fr.getEntityIdentifier()).thenReturn("REQ-1");
        when(fr.getName()).thenReturn("Login");
        when(fr.getDescription()).thenReturn("User login");
        when(fr.getState()).thenReturn(RequirementState.APPROVED);
        when(fr.getFunctionality()).thenReturn(functionality);

        when(functionality.getId()).thenReturn(10L);

        RequirementSummary result = SummaryMapper.toRequirementSummary(fr);

        assertInstanceOf(FunctionalRequirementSummaryDTO.class, result);

        FunctionalRequirementSummaryDTO dto =
                (FunctionalRequirementSummaryDTO) result;

        assertEquals(1L, dto.id());
        assertEquals("REQ-1", dto.entityIdentifier());
        assertEquals("Login", dto.name());
        assertEquals("User login", dto.description());
        assertEquals("APPROVED", dto.state());
        assertEquals(10L, dto.functionalityId());
        assertEquals("FR", dto.requirementType());
    }

    @Test
    void shouldMapFunctionalRequirementWithNullFunctionality() {
        FunctionalRequirement fr = mock(FunctionalRequirement.class);

        when(fr.getId()).thenReturn(1L);
        when(fr.getEntityIdentifier()).thenReturn("REQ-1");
        when(fr.getName()).thenReturn("Login");
        when(fr.getDescription()).thenReturn("User login");
        when(fr.getState()).thenReturn(RequirementState.APPROVED);
        when(fr.getFunctionality()).thenReturn(null);

        FunctionalRequirementSummaryDTO dto =
                (FunctionalRequirementSummaryDTO)
                        SummaryMapper.toRequirementSummary(fr);

        assertNull(dto.functionalityId());
        assertEquals("FR", dto.requirementType());
    }

    @Test
    void shouldMapNonFunctionalRequirement() {
        Requirement requirement = mock(Requirement.class);

        when(requirement.getId()).thenReturn(2L);
        when(requirement.getEntityIdentifier()).thenReturn("REQ-2");
        when(requirement.getName()).thenReturn("Performance");
        when(requirement.getDescription()).thenReturn("Fast response");
        when(requirement.getState()).thenReturn(RequirementState.PENDING_APPROVAL);

        RequirementSummary result =
                SummaryMapper.toRequirementSummary(requirement);

        assertInstanceOf(RequirementSummaryDTO.class, result);

        RequirementSummaryDTO dto = (RequirementSummaryDTO) result;

        assertEquals(2L, dto.id());
        assertEquals("REQ-2", dto.entityIdentifier());
        assertEquals("Performance", dto.name());
        assertEquals("Fast response", dto.description());
        assertEquals("PENDING_APPROVAL", dto.state());
        assertEquals("NFR", dto.requirementType());
    }

    @Test
    void shouldHandleNullState() {
        Requirement requirement = mock(Requirement.class);

        when(requirement.getId()).thenReturn(2L);
        when(requirement.getEntityIdentifier()).thenReturn("REQ-2");
        when(requirement.getName()).thenReturn("Performance");
        when(requirement.getDescription()).thenReturn("Fast response");
        when(requirement.getState()).thenReturn(null);

        RequirementSummaryDTO dto =
                (RequirementSummaryDTO)
                        SummaryMapper.toRequirementSummary(requirement);

        assertNull(dto.state());
    }

    @Test
    void shouldMapRequirementList() {
        Requirement r1 = mock(Requirement.class);

        FunctionalRequirement r2 = mock(FunctionalRequirement.class);
        Functionality functionality = mock(Functionality.class);

        when(r1.getId()).thenReturn(1L);
        when(r1.getEntityIdentifier()).thenReturn("NFR-1");
        when(r1.getName()).thenReturn("Performance");
        when(r1.getDescription()).thenReturn("Fast");
        when(r1.getState()).thenReturn(RequirementState.PENDING_APPROVAL);

        when(r2.getId()).thenReturn(2L);
        when(r2.getEntityIdentifier()).thenReturn("FR-1");
        when(r2.getName()).thenReturn("Login");
        when(r2.getDescription()).thenReturn("Authentication");
        when(r2.getState()).thenReturn(RequirementState.APPROVED);
        when(r2.getFunctionality()).thenReturn(functionality);

        when(functionality.getId()).thenReturn(100L);

        List<RequirementSummary> result =
                SummaryMapper.toRequirementSummaries(List.of(r1, r2));

        assertEquals(2, result.size());
        assertInstanceOf(RequirementSummaryDTO.class, result.get(0));
        assertInstanceOf(FunctionalRequirementSummaryDTO.class, result.get(1));
    }
}