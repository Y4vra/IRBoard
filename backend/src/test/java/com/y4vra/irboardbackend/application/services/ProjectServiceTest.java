package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
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
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private PermissionService permService;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private ProjectDTO projectDTO;

    @BeforeEach
    void setUp() {
        project = new Project("IR-Board", "Description", "TERNARY");
        project.setId(1L);

        projectDTO = new ProjectDTO(1L, "IR-Board", "Description", "TERNARY", "ACTIVE", 0,null,null,false);
    }

    @Test
    void findAllProjects_returnsAllProjects() {
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        List<ProjectDTO> result = projectService.findAllProjects();

        assertThat(result).hasSize(1).containsExactly(projectDTO);
    }

    @Test
    void findAllProjects_returnsEmptyListWhenNoneExist() {
        when(projectRepository.findAll()).thenReturn(List.of());

        List<ProjectDTO> result = projectService.findAllProjects();

        assertThat(result).isEmpty();
    }

    @Test
    void findProjectsForUser_returnsOnlyAuthorizedProjects() {
        String oryId = "user-ory-123";
        when(permService.getAuthorizedObjects(oryId, "Project", "view")).thenReturn(List.of("1"));
        when(projectRepository.findAllById(List.of(1L))).thenReturn(List.of(project));
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        List<ProjectDTO> result = projectService.findProjectsForUser(oryId);

        assertThat(result).containsExactly(projectDTO);
        verify(permService).getAuthorizedObjects(oryId, "Project", "view");
    }

    @Test
    void findProjectsForUser_returnsEmptyListWhenNoPermissions() {
        String oryId = "user-ory-456";
        when(permService.getAuthorizedObjects(oryId, "Project", "view")).thenReturn(List.of());
        when(projectRepository.findAllById(List.of())).thenReturn(List.of());

        List<ProjectDTO> result = projectService.findProjectsForUser(oryId);

        assertThat(result).isEmpty();
    }

    @Test
    void createProject_savesProjectAndCreatesKetoRelation() {
        String oryId = "admin-ory-789";
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        ProjectDTO result = projectService.createProject(projectDTO, oryId);

        assertThat(result).isEqualTo(projectDTO);
        verify(projectRepository).save(any(Project.class));
        verify(permService).grantPermission("Project", "1", "managers", oryId);
    }

    @Test
    void findById_returnsProjectWhenAuthorized() {
        String oryId = "user-ory-123";
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        ProjectDTO result = projectService.findById(oryId, 1L);

        assertThat(result).isEqualTo(projectDTO);
    }

    @Test
    void findById_throwsAccessDeniedWhenNotAuthorized() {
        String oryId = "user-ory-unauthorized";
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> projectService.findById(oryId, 1L))
                .isInstanceOf(AccessDeniedException.class);

        verify(projectRepository, never()).findById(any());
    }

    @Test
    void findById_throwsEntityNotFoundWhenProjectDoesNotExist() {
        String oryId = "user-ory-123";
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.findById(oryId, 1L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Project not found");
    }
}
