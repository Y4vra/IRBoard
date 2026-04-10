package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NonFunctionalRequirementServiceTest {

    @Mock
    private NonFunctionalRequirementRepository nfrRepository;

    @Mock
    private NonFunctionalRequirementMapper nfrMapper;

    @Mock
    private KetoClient ketoClient;

    @InjectMocks
    private NonFunctionalRequirementService nfrService;

    private NonFunctionalRequirement nfr;
    private NonFunctionalRequirementDTO nfrDTO;
    private final String oryId = "user-ory-123";
    private final Long projectId = 1L;

    @BeforeEach
    void setUp() {
        Project project = new Project();
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
                7L, "Response Time", "Must respond under threshold",
                "ms", "LESS_THAN", 200.0, 100.0, 150.0, projectId
        );
    }

    @Test
    void findNonFunctionalRequirementsOfProject_returnsListWhenAuthorized() {
        when(ketoClient.check("Project", "1", "view", oryId)).thenReturn(true);
        when(nfrRepository.findAllByProjectId(projectId)).thenReturn(List.of(nfr));
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);

        List<NonFunctionalRequirementDTO> result = nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId);

        assertThat(result).hasSize(1).containsExactly(nfrDTO);
    }

    @Test
    void findNonFunctionalRequirementsOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(ketoClient.check("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(nfrRepository, never()).findAllByProjectId(any());
    }

    @Test
    void findNonFunctionalRequirementsOfProject_returnsEmptyListWhenNoneExist() {
        when(ketoClient.check("Project", "1", "view", oryId)).thenReturn(true);
        when(nfrRepository.findAllByProjectId(projectId)).thenReturn(List.of());

        List<NonFunctionalRequirementDTO> result = nfrService.findNonFunctionalRequirementsOfProject(oryId, projectId);

        assertThat(result).isEmpty();
        verify(nfrMapper, never()).toDto(any());
    }

    @Test
    void createNonFunctionalRequirement_savesAndCreatesKetoRelations() {
        when(nfrMapper.toEntity(nfrDTO)).thenReturn(nfr);
        when(nfrRepository.save(nfr)).thenReturn(nfr);
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);

        NonFunctionalRequirementDTO result = nfrService.createNonFunctionalRequirement(nfrDTO, oryId);

        assertThat(result).isEqualTo(nfrDTO);
        verify(nfrRepository).save(nfr);
        verify(ketoClient).createRelation("Requirement", "7", "parents", "Project:" + projectId);
        verify(ketoClient).createRelation("Requirement", "7", "managers", oryId);
    }

    @Test
    void createNonFunctionalRequirement_createsBothKetoRelationsInOrder() {
        when(nfrMapper.toEntity(nfrDTO)).thenReturn(nfr);
        when(nfrRepository.save(nfr)).thenReturn(nfr);
        when(nfrMapper.toDto(nfr)).thenReturn(nfrDTO);

        nfrService.createNonFunctionalRequirement(nfrDTO, oryId);

        var inOrder = inOrder(nfrRepository, ketoClient);
        inOrder.verify(nfrRepository).save(nfr);
        inOrder.verify(ketoClient).createRelation(eq("Requirement"), any(), eq("parents"), any());
        inOrder.verify(ketoClient).createRelation(eq("Requirement"), any(), eq("managers"), any());
    }
}
