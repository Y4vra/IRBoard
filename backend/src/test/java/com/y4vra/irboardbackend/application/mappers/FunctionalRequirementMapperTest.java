package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FunctionalRequirementMapperTest {

    private StakeholderMapper stakeholderMapper;
    private DocumentMapper documentMapper;
    private NonFunctionalRequirementMapper nonFunctionalRequirementMapper;

    private FunctionalRequirementMapper mapper;

    @BeforeEach
    void setUp() {
        stakeholderMapper = mock(StakeholderMapper.class);
        documentMapper = mock(DocumentMapper.class);
        nonFunctionalRequirementMapper = mock(NonFunctionalRequirementMapper.class);

        when(stakeholderMapper.toDtoList(anyList())).thenReturn(List.of());
        when(documentMapper.toDtoList(anyList())).thenReturn(List.of());
        when(nonFunctionalRequirementMapper.toDtoList(anyList())).thenReturn(List.of());

        mapper = new FunctionalRequirementMapper(
                stakeholderMapper,
                documentMapper,
                nonFunctionalRequirementMapper
        );
    }

    @Test
    void shouldReturnNullWhenDtoSourceIsNull() {
        assertNull(mapper.toDto(null));
    }

    @Test
    void shouldReturnNullWhenDetailedDtoSourceIsNull() {
        assertNull(mapper.toDetailedDto(null, List.of(), List.of(), List.of(), List.of()));
    }

    @Test
    void shouldMapFunctionalRequirementToDto() {
        Functionality functionality = mock(Functionality.class);
        when(functionality.getId()).thenReturn(100L);

        FunctionalRequirement requirement = mock(FunctionalRequirement.class);

        when(requirement.getId()).thenReturn(1L);
        when(requirement.getEntityIdentifier()).thenReturn("FR-1");
        when(requirement.getName()).thenReturn("Login");
        when(requirement.getDescription()).thenReturn("User login");
        when(requirement.getPriority()).thenReturn("HIGH");
        when(requirement.getStability()).thenReturn("STABLE");
        when(requirement.getFunctionality()).thenReturn(functionality);
        when(requirement.getParent()).thenReturn(null);
        when(requirement.getOrderValue()).thenReturn(1L);
        when(requirement.getState()).thenReturn(RequirementState.APPROVED);
        when(requirement.getChildren()).thenReturn(Set.of());

        FunctionalRequirementDTO dto = mapper.toDto(requirement);

        assertEquals(1L, dto.id());
        assertEquals("FR-1", dto.entityIdentifier());
        assertEquals("Login", dto.name());
        assertEquals("User login", dto.description());
        assertEquals("HIGH", dto.priority());
        assertEquals("STABLE", dto.stability());
        assertEquals(100L, dto.functionalityId());
        assertNull(dto.parentId());
        assertEquals(1, dto.orderValue());
        assertEquals("APPROVED", dto.state());
        assertTrue(dto.children().isEmpty());
    }

    @Test
    void shouldMapParentIdWhenPresent() {
        FunctionalRequirement parent = mock(FunctionalRequirement.class);
        when(parent.getId()).thenReturn(99L);

        FunctionalRequirement requirement = mock(FunctionalRequirement.class);

        when(requirement.getId()).thenReturn(1L);
        when(requirement.getEntityIdentifier()).thenReturn("FR-1");
        when(requirement.getName()).thenReturn("Login");
        when(requirement.getDescription()).thenReturn("Description");
        when(requirement.getPriority()).thenReturn("HIGH");
        when(requirement.getStability()).thenReturn("STABLE");
        when(requirement.getFunctionality()).thenReturn(null);
        when(requirement.getParent()).thenReturn(parent);
        when(requirement.getOrderValue()).thenReturn(5L);
        when(requirement.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(requirement.getChildren()).thenReturn(Set.of());

        FunctionalRequirementDTO dto = mapper.toDto(requirement);

        assertEquals(99L, dto.parentId());
    }

    @Test
    void shouldSortChildrenByOrderValue() {
        FunctionalRequirement child1 = mock(FunctionalRequirement.class);
        FunctionalRequirement child2 = mock(FunctionalRequirement.class);

        when(child1.getId()).thenReturn(1L);
        when(child1.getEntityIdentifier()).thenReturn("FR-1");
        when(child1.getName()).thenReturn("Child1");
        when(child1.getDescription()).thenReturn("Desc");
        when(child1.getPriority()).thenReturn("HIGH");
        when(child1.getStability()).thenReturn("STABLE");
        when(child1.getOrderValue()).thenReturn(2L);
        when(child1.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(child1.getChildren()).thenReturn(Set.of());

        when(child2.getId()).thenReturn(2L);
        when(child2.getEntityIdentifier()).thenReturn("FR-2");
        when(child2.getName()).thenReturn("Child2");
        when(child2.getDescription()).thenReturn("Desc");
        when(child2.getPriority()).thenReturn("HIGH");
        when(child2.getStability()).thenReturn("STABLE");
        when(child2.getOrderValue()).thenReturn(1L);
        when(child2.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(child2.getChildren()).thenReturn(Set.of());

        FunctionalRequirement root = mock(FunctionalRequirement.class);

        when(root.getId()).thenReturn(100L);
        when(root.getEntityIdentifier()).thenReturn("ROOT");
        when(root.getName()).thenReturn("Root");
        when(root.getDescription()).thenReturn("Root");
        when(root.getPriority()).thenReturn("HIGH");
        when(root.getStability()).thenReturn("STABLE");
        when(root.getOrderValue()).thenReturn(0L);
        when(root.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(root.getChildren()).thenReturn(Set.of(child1, child2));

        FunctionalRequirementDTO dto = mapper.toDto(root);

        assertEquals(2L, dto.children().get(0).id());
        assertEquals(1L, dto.children().get(1).id());
    }

    @Test
    void shouldMapDtoToEntity() {
        Functionality functionality = mock(Functionality.class);

        FunctionalRequirementDTO dto = mock(FunctionalRequirementDTO.class);

        when(dto.id()).thenReturn(1L);
        when(dto.name()).thenReturn("Login");
        when(dto.description()).thenReturn("Description");
        when(dto.orderValue()).thenReturn(10L);
        when(dto.priority()).thenReturn("HIGH");
        when(dto.stability()).thenReturn("STABLE");

        FunctionalRequirement entity = mapper.toEntity(dto, functionality);

        assertEquals(1L, entity.getId());
        assertEquals("Login", entity.getName());
        assertEquals("Description", entity.getDescription());
        assertEquals(10, entity.getOrderValue());
        assertEquals("HIGH", entity.getPriority());
        assertEquals("STABLE", entity.getStability());
        assertEquals(functionality, entity.getFunctionality());
    }

    @Test
    void shouldReturnNullWhenEntitySourceIsNull() {
        assertNull(mapper.toEntity(null, null));
    }

    @Test
    void shouldMapDtoList() {
        FunctionalRequirement fr1 = mock(FunctionalRequirement.class);
        FunctionalRequirement fr2 = mock(FunctionalRequirement.class);

        when(fr1.getId()).thenReturn(1L);
        when(fr1.getEntityIdentifier()).thenReturn("FR-1");
        when(fr1.getName()).thenReturn("A");
        when(fr1.getDescription()).thenReturn("A");
        when(fr1.getPriority()).thenReturn("HIGH");
        when(fr1.getStability()).thenReturn("STABLE");
        when(fr1.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(fr1.getChildren()).thenReturn(Set.of());

        when(fr2.getId()).thenReturn(2L);
        when(fr2.getEntityIdentifier()).thenReturn("FR-2");
        when(fr2.getName()).thenReturn("B");
        when(fr2.getDescription()).thenReturn("B");
        when(fr2.getPriority()).thenReturn("HIGH");
        when(fr2.getStability()).thenReturn("STABLE");
        when(fr2.getState()).thenReturn(RequirementState.PENDING_APPROVAL);
        when(fr2.getChildren()).thenReturn(Set.of());

        List<FunctionalRequirementDTO> result =
                mapper.toDtoList(List.of(fr1, fr2));

        assertEquals(2, result.size());
    }

    @Test
    void shouldPatchOnlyProvidedFields() {
        FunctionalRequirementDTO patch = mock(FunctionalRequirementDTO.class);

        when(patch.name()).thenReturn("Updated");
        when(patch.description()).thenReturn("Updated Description");
        when(patch.stability()).thenReturn("LOW");

        FunctionalRequirement entity = new FunctionalRequirement();
        entity.setName("Old");
        entity.setDescription("Old Description");
        entity.setStability("HIGH");

        mapper.patchEntity(patch, entity);

        assertEquals("Updated", entity.getName());
        assertEquals("Updated Description", entity.getDescription());
        assertEquals("LOW", entity.getStability());
    }

    @Test
    void shouldIgnoreBlankValuesDuringPatch() {
        FunctionalRequirementDTO patch = mock(FunctionalRequirementDTO.class);

        when(patch.name()).thenReturn(" ");
        when(patch.description()).thenReturn("");
        when(patch.stability()).thenReturn(null);

        FunctionalRequirement entity = new FunctionalRequirement();
        entity.setName("Original");
        entity.setDescription("Original Description");
        entity.setStability("HIGH");

        mapper.patchEntity(patch, entity);

        assertEquals("Original", entity.getName());
        assertEquals("Original Description", entity.getDescription());
        assertEquals("HIGH", entity.getStability());
    }

    @Test
    void shouldIgnoreNullPatch() {
        FunctionalRequirement entity = new FunctionalRequirement();
        entity.setName("Original");

        mapper.patchEntity(null, entity);

        assertEquals("Original", entity.getName());
    }
}