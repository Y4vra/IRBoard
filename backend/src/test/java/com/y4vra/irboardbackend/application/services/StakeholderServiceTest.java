package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.StakeholderMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import jakarta.persistence.EntityNotFoundException;
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
class StakeholderServiceTest {

    @Mock
    private StakeholderRepository stakeholderRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private StakeholderMapper stakeholderMapper;

    @Mock
    private PermissionService permService;

    @InjectMocks
    private StakeholderService stakeholderService;

    private Project project;
    private Stakeholder stakeholder;
    private StakeholderDTO stakeholderDTO;
    private final String oryId = "user-ory-123";
    private final long projectId = 1L;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(projectId);

        stakeholder = new Stakeholder();
        stakeholder.setId(5L);
        stakeholder.setName("End User");
        stakeholder.setDescription("Primary system user");
        stakeholder.setProject(project);

        stakeholderDTO = new StakeholderDTO(5L, "End User", "Primary system user", EntityState.ACTIVE.name(), projectId, List.of());
    }

    @Test
    void findStakeholdersOfProject_returnsStakeholdersWhenAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(stakeholderRepository.findByProjectId(projectId)).thenReturn(List.of(stakeholder));
        when(stakeholderMapper.toDto(stakeholder)).thenReturn(stakeholderDTO);

        List<StakeholderDTO> result = stakeholderService.findStakeholdersOfProject(oryId, projectId);

        assertThat(result).hasSize(1).containsExactly(stakeholderDTO);
    }

    @Test
    void findStakeholdersOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> stakeholderService.findStakeholdersOfProject(oryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(stakeholderRepository, never()).findByProjectId(any());
    }

    @Test
    void findStakeholdersOfProject_returnsEmptyListWhenNoneExist() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(stakeholderRepository.findByProjectId(projectId)).thenReturn(List.of());

        List<StakeholderDTO> result = stakeholderService.findStakeholdersOfProject(oryId, projectId);

        assertThat(result).isEmpty();
        verify(stakeholderMapper, never()).toDto(any());
    }

    @Test
    void createStakeholder_savesAndReturnsDto() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(stakeholderRepository.save(any(Stakeholder.class))).thenReturn(stakeholder);
        when(stakeholderMapper.toDto(stakeholder)).thenReturn(stakeholderDTO);

        StakeholderDTO result = stakeholderService.createStakeholder(oryId,stakeholderDTO, projectId);

        assertThat(result).isEqualTo(stakeholderDTO);
        verify(stakeholderRepository).save(any(Stakeholder.class));
    }

    @Test
    void createStakeholder_setsProjectOnEntity() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(stakeholderRepository.save(any(Stakeholder.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stakeholderMapper.toDto(any(Stakeholder.class))).thenReturn(stakeholderDTO);

        stakeholderService.createStakeholder(oryId,stakeholderDTO, projectId);

        verify(stakeholderRepository).save(argThat(s ->
                s.getProject().equals(project) &&
                s.getName().equals("End User") &&
                s.getDescription().equals("Primary system user")
        ));
    }

    @Test
    void createStakeholder_throwsEntityNotFoundWhenProjectDoesNotExist() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stakeholderService.createStakeholder(oryId,stakeholderDTO, projectId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Project not found");

        verify(stakeholderRepository, never()).save(any());
    }
}
