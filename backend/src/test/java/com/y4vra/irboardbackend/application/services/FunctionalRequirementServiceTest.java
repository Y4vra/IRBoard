package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FunctionalRequirementServiceTest {

    @Mock
    private FunctionalRequirementRepository frRepository;

    @Mock
    private NonFunctionalRequirementRepository nfrRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private StakeholderRepository stakeholderRepository;

    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private FunctionalRequirementMapper frMapper;

    @Mock
    private FunctionalityRepository functionalityRepository;

    @Mock
    private PermissionService permService;

    @Mock
    private FunctionalityMapper functionalityMapper;

    @Mock
    private FunctionalityService functionalityService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EntityLockService entityLockService;

    @InjectMocks
    private FunctionalRequirementService service;

    private final String oryId = "user-ory-123";
    private final Long projectId = 1L;
    private final Long functionalityId = 2L;
    private final Long requirementId = 3L;

    private Project project;
    private Functionality functionality;
    private FunctionalRequirement requirement;
    private FunctionalRequirementDTO dto;

    @BeforeEach
    void setUp() {

        project = new Project();
        project.setId(projectId);
        project.setPriorityStyle(PriorityStyle.TERNARY);

        functionality = new Functionality();
        functionality.setId(functionalityId);
        functionality.setProject(project);
        functionality.setState(FunctionalityState.ACTIVE);

        requirement = new FunctionalRequirement();
        requirement.setId(requirementId);
        requirement.setProject(project);
        requirement.setFunctionality(functionality);
        requirement.setName("Login");
        requirement.setDescription("User login");
        requirement.setState(RequirementState.PENDING_APPROVAL);

        dto = new FunctionalRequirementDTO(
                requirementId,
                "FR-001",
                "Login",
                "User login",
                "HIGH",
                "LOW",
                functionalityId,
                null,
                1L,
                RequirementState.PENDING_APPROVAL.name(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    @Test
    void findFunctionalRequirementsNotRemovedOfFunctionality_returnsListWhenAuthorized() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "viewRequirements",
                oryId))
                .thenReturn(true);

        when(frRepository.findAllByFunctionalityIdAndProjectIdNotRemoved(
                functionalityId,
                projectId))
                .thenReturn(List.of(requirement));

        when(frMapper.toDto(requirement)).thenReturn(dto);

        List<FunctionalRequirementDTO> result =
                service.findFunctionalRequirementsNotRemovedOfFunctionality(
                        oryId,
                        projectId,
                        functionalityId);

        assertThat(result)
                .hasSize(1)
                .containsExactly(dto);
    }

    @Test
    void findFunctionalRequirementsNotRemovedOfFunctionality_throwsWhenUnauthorized() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "viewRequirements",
                oryId))
                .thenReturn(false);

        assertThatThrownBy(() ->
                service.findFunctionalRequirementsNotRemovedOfFunctionality(
                        oryId,
                        projectId,
                        functionalityId))
                .isInstanceOf(AccessDeniedException.class);

        verify(frRepository, never())
                .findAllByFunctionalityIdAndProjectIdNotRemoved(any(), any());
    }

    @Test
    void findFunctionalRequirementsNotRemovedOfFunctionality_returnsEmptyList() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "viewRequirements",
                oryId))
                .thenReturn(true);

        when(frRepository.findAllByFunctionalityIdAndProjectIdNotRemoved(
                functionalityId,
                projectId))
                .thenReturn(List.of());

        List<FunctionalRequirementDTO> result =
                service.findFunctionalRequirementsNotRemovedOfFunctionality(
                        oryId,
                        projectId,
                        functionalityId);

        assertThat(result).isEmpty();

        verify(frMapper, never()).toDto(any());
    }

    @Test
    void findFunctionalRequirementsRemovedOfFunctionality_returnsListWhenAuthorized() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "viewRequirements",
                oryId))
                .thenReturn(true);

        when(frRepository.findAllByFunctionalityIdAndProjectIdRemoved(
                functionalityId,
                projectId))
                .thenReturn(List.of(requirement));

        when(frMapper.toDto(requirement)).thenReturn(dto);

        List<FunctionalRequirementDTO> result =
                service.findFunctionalRequirementsRemovedOfFunctionality(
                        oryId,
                        projectId,
                        functionalityId);

        assertThat(result)
                .hasSize(1)
                .containsExactly(dto);
    }

    @Test
    void createFunctionalRequirement_savesRequirement() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "editRequirements",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                projectId,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        when(frMapper.toEntity(dto, functionality))
                .thenReturn(requirement);

        when(frRepository.save(requirement))
                .thenReturn(requirement);

        when(frMapper.toDto(requirement))
                .thenReturn(dto);

        FunctionalRequirementDTO result =
                service.createFunctionalRequirement(
                        oryId,
                        dto,
                        projectId,
                        functionalityId);

        assertThat(result).isEqualTo(dto);

        verify(frRepository).save(requirement);
    }

    @Test
    void createFunctionalRequirement_throwsWhenUnauthorized() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "editRequirements",
                oryId))
                .thenReturn(false);

        assertThatThrownBy(() ->
                service.createFunctionalRequirement(
                        oryId,
                        dto,
                        projectId,
                        functionalityId))
                .isInstanceOf(AccessDeniedException.class);

        verify(frRepository, never()).save(any());
    }

    @Test
    void updatePriority_acceptsTernaryHigh() {

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        service.updatePriority(
                requirement,
                "HIGH",
                projectId,
                functionalityId);

        assertThat(requirement.getPriority()).isEqualTo("HIGH");
    }

    @Test
    void updatePriority_acceptsTernaryNormal() {

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        service.updatePriority(
                requirement,
                "NORMAL",
                projectId,
                functionalityId);

        assertThat(requirement.getPriority()).isEqualTo("NORMAL");
    }

    @Test
    void updatePriority_acceptsTernaryLow() {

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        service.updatePriority(
                requirement,
                "LOW",
                projectId,
                functionalityId);

        assertThat(requirement.getPriority()).isEqualTo("LOW");
    }

    @Test
    void updatePriority_throwsForInvalidPriority() {

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        assertThatThrownBy(() ->
                service.updatePriority(
                        requirement,
                        "INVALID",
                        projectId,
                        functionalityId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid priority");
    }

    @Test
    void updatePriority_acceptsMoscowValues() {

        project.setPriorityStyle(PriorityStyle.MOSCOW);

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        service.updatePriority(
                requirement,
                "MUST",
                projectId,
                functionalityId);

        assertThat(requirement.getPriority()).isEqualTo("MUST");
    }

    @Test
    void createFunctionalRequirement_callsSaveOnce() {

        when(permService.checkPermission(
                "Functionality",
                functionalityId.toString(),
                "editRequirements",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                projectId,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(functionalityRepository
                .findByIdAndStateAndProjectIdAndProjectState(
                        functionalityId,
                        FunctionalityState.ACTIVE,
                        projectId,
                        ProjectState.ACTIVE))
                .thenReturn(Optional.of(functionality));

        when(frMapper.toEntity(dto, functionality))
                .thenReturn(requirement);

        when(frRepository.save(requirement))
                .thenReturn(requirement);

        when(frMapper.toDto(requirement))
                .thenReturn(dto);

        service.createFunctionalRequirement(
                oryId,
                dto,
                projectId,
                functionalityId);

        verify(frRepository, times(1))
                .save(requirement);
    }
}