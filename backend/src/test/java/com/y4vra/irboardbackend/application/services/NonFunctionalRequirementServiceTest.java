package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NonFunctionalRequirementServiceTest {

    @Mock
    private NonFunctionalRequirementRepository nfrRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private NonFunctionalRequirementMapper nfrMapper;

    @Mock
    private PermissionService permService;

    @InjectMocks
    private NonFunctionalRequirementService nfrService;

    private Project project;
    private NonFunctionalRequirement nfr;
    private NonFunctionalRequirementDTO nfrDTO;
    private final String oryId = "user-ory-123";
    private final Long projectId = 1L;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(projectId);

        nfr = new NonFunctionalRequirement();
        nfr.setId(7L);
        nfr.setName("Response Time");
        nfr.setDescription("Must respond under threshold");
        nfr.setMeasurementUnit("ms");
        nfr.setOperator(ComparisonOperator.LESS_THAN);
        nfr.setThresholdValue(200.0);
        nfr.setTargetValue(100.0);
        nfr.setActualValue(150.0);
        nfr.setProject(project);

        nfrDTO = new NonFunctionalRequirementDTO(
                7L, "Response Time", "Must respond under threshold", RequirementState.PENDING_APPROVAL.name(),
                "ms", "LESS_THAN", 200.0, 100.0, 150.0, projectId,null,null,false
        );
    }

    @Test
    void findNonFunctionalRequirementsOfProject_returnsListWhenAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(nfrRepository.findAllByProjectId(projectId)).thenReturn(List.of(nfr));
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);

        List<NonFunctionalRequirementDTO> result = nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId);

        assertThat(result).hasSize(1).containsExactly(nfrDTO);
    }

    @Test
    void findNonFunctionalRequirementsOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(nfrRepository, never()).findAllByProjectId(any());
    }

    @Test
    void findNonFunctionalRequirementsOfProject_returnsEmptyListWhenNoneExist() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(nfrRepository.findAllByProjectId(projectId)).thenReturn(List.of());

        List<NonFunctionalRequirementDTO> result = nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId);

        assertThat(result).isEmpty();
        verify(nfrMapper, never()).toDto(any());
    }

    @Test
    void createNonFunctionalRequirement_savesAndCreatesKetoRelations() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(nfrMapper.toEntity(nfrDTO)).thenReturn(nfr);
        when(nfrRepository.save(nfr)).thenReturn(nfr);
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);

        NonFunctionalRequirementDTO result = nfrService.createNonFunctionalRequirement(oryId,nfrDTO, projectId);

        assertThat(result).isEqualTo(nfrDTO);
        verify(nfrRepository).save(nfr);
    }

    @Test
    void createNonFunctionalRequirement_createsBothKetoRelationsInOrder() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(nfrMapper.toEntity(nfrDTO)).thenReturn(nfr);
        when(nfrRepository.save(nfr)).thenReturn(nfr);
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);

        nfrService.createNonFunctionalRequirement(oryId,nfrDTO, projectId);

        var inOrder = inOrder(nfrRepository, permService);
        inOrder.verify(nfrRepository).save(nfr);
    }
}
