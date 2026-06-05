package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StatisticsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
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

    @Mock
    private EntityLockService entityLockService;

    @Mock
    private StatisticsRepository statisticsRepository;

    @Mock
    private DocumentService documentService;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ObjectStorageService objectStorageService;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private ProjectDTO projectDTO;

    @BeforeEach
    void setUp() {
        project = new Project("IR-Board", "Description", "TERNARY");
        project.setId(1L);

        projectDTO = new ProjectDTO(1L, "IR-Board", "Description", "TERNARY", "ACTIVE", false, null, null,null, null);
    }

    @Test
    void findAllProjects_returnsAllProjects() {
        when(projectRepository.findAllByStateNot(ProjectState.REMOVED)).thenReturn(List.of(project));
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        List<ProjectDTO> result = projectService.findAllProjectsNotRemoved();

        assertThat(result).hasSize(1).containsExactly(projectDTO);
    }

    @Test
    void findAllProjects_returnsEmptyListWhenNoneExist() {
        when(projectRepository.findAllByStateNot(ProjectState.REMOVED)).thenReturn(List.of());

        List<ProjectDTO> result = projectService.findAllProjectsNotRemoved();

        assertThat(result).isEmpty();
    }

    @Test
    void findProjectsForUser_returnsOnlyAuthorizedProjects() {
        String oryId = "user-ory-123";
        when(projectRepository.findAllIds()).thenReturn(List.of(1L));
        when(permService.filterAuthorizedObjects(oryId, "Project", "view", List.of(String.valueOf(1L)))).thenReturn(List.of("1"));
        when(projectRepository.findAllById(List.of(1L))).thenReturn(List.of(project));
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        List<ProjectDTO> result = projectService.findProjectsForUser(oryId);

        assertThat(result).containsExactly(projectDTO);
        verify(permService).filterAuthorizedObjects(oryId, "Project", "view",List.of(String.valueOf(1L)));
    }

    @Test
    void findProjectsForUser_returnsEmptyListWhenNoPermissions() {
        String oryId = "user-ory-456";
        when(projectRepository.findAllIds()).thenReturn(List.of(1L));
        when(permService.filterAuthorizedObjects(oryId, "Project", "view", List.of(String.valueOf(1L)))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of())).thenReturn(List.of());

        List<ProjectDTO> result = projectService.findProjectsForUser(oryId);

        assertThat(result).isEmpty();
    }

    @Test
    void createProject_savesProjectAndCreatesKetoRelations() {
        String oryId = "admin-ory-789";
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(projectMapper.toDto(project)).thenReturn(projectDTO);

        ProjectDTO result = projectService.createProject(projectDTO, oryId);

        assertThat(result).isEqualTo(projectDTO);
        verify(projectRepository).save(any(Project.class));
        verify(permService).grantPermission("Project", "1", "managers", oryId);
        verify(permService).grantPermissionToSubjectSet(
                "Project", "1", "parent_system", "System", "main", "admins"
        );
    }

    @Test
    void findById_returnsProjectWhenAuthorized() {
        String oryId = "user-ory-123";
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(false);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(statisticsRepository.getStakeholderStatistics(1L)).thenReturn(null);
        when(statisticsRepository.getDocumentStatistics(1L)).thenReturn(null);
        when(statisticsRepository.getNonFunctionalRequirementStatistics(1L)).thenReturn(null);
        when(statisticsRepository.getFunctionalitiesStatistics(1L)).thenReturn(null);
        when(projectMapper.toDto(project, false, null, null, null, null)).thenReturn(projectDTO);

        ProjectDTO result = projectService.findById(oryId, 1L);

        assertThat(result).isEqualTo(projectDTO);
        verify(projectMapper).toDto(project, false, null, null, null, null);
    }

    @Test
    void findById_throwsAccessDeniedWhenNotAuthorized() {
        String oryId = "user-ory-unauthorized";
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> projectService.findById(oryId, 1L))
                .isInstanceOf(AccessDeniedException.class);

        verify(projectRepository, never()).findByIdAndState(any(), eq(ProjectState.ACTIVE));
        verify(projectMapper, never()).toDto(any(), anyBoolean(), any(), any(), any(), any());
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
    @Test
    void findAllProjectsRemoved_returnsAllRemovedProjects() {

        project.setState(ProjectState.REMOVED);

        when(projectRepository.findAllByState(ProjectState.REMOVED))
                .thenReturn(List.of(project));

        when(projectMapper.toDto(project))
                .thenReturn(projectDTO);

        List<ProjectDTO> result = projectService.findAllProjectsRemoved();

        assertThat(result)
                .hasSize(1)
                .containsExactly(projectDTO);
    }

    @Test
    void findAllProjectsRemoved_returnsEmptyListWhenNoneExist() {

        when(projectRepository.findAllByState(ProjectState.REMOVED))
                .thenReturn(List.of());

        List<ProjectDTO> result = projectService.findAllProjectsRemoved();

        assertThat(result).isEmpty();
    }
    @Test
    void createProject_grantsPermissionsInOrder() {

        String oryId = "admin";

        when(projectRepository.save(any(Project.class)))
                .thenReturn(project);

        when(projectMapper.toDto(project))
                .thenReturn(projectDTO);

        projectService.createProject(projectDTO, oryId);

        InOrder inOrder = inOrder(projectRepository, permService);

        inOrder.verify(projectRepository)
                .save(any(Project.class));

        inOrder.verify(permService)
                .grantPermission(
                        "Project",
                        "1",
                        "managers",
                        oryId);

        inOrder.verify(permService)
                .grantPermissionToSubjectSet(
                        "Project",
                        "1",
                        "parent_system",
                        "System",
                        "main",
                        "admins");
    }
    @Test
    void requestEdit_locksProject() {

        User user = new User();

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        projectService.requestEdit(1L, user);

        verify(entityLockService)
                .lock(project, user);
    }

    @Test
    void requestEdit_throwsWhenProjectNotFound() {

        User user = new User();

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                projectService.requestEdit(1L, user))
                .isInstanceOf(EntityNotFoundException.class);
    }
    @Test
    void patch_updatesProjectWhenLocked() {

        User user = new User();

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(entityLockService.isLockedByUser(project, user))
                .thenReturn(true);

        when(projectRepository.save(project))
                .thenReturn(project);

        when(projectMapper.toDto(project))
                .thenReturn(projectDTO);

        ProjectDTO result =
                projectService.patch(
                        1L,
                        projectDTO,
                        user);

        assertThat(result).isEqualTo(projectDTO);

        verify(projectMapper)
                .patchEntity(projectDTO, project);

        verify(entityLockService)
                .unlock(project, user);
    }

    @Test
    void patch_throwsWhenUserDoesNotHoldLock() {

        User user = new User();

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(entityLockService.isLockedByUser(project, user))
                .thenReturn(false);

        assertThatThrownBy(() ->
                projectService.patch(
                        1L,
                        projectDTO,
                        user))
                .isInstanceOf(LockableEntityException.class);

        verify(projectRepository, never())
                .save(any());
    }
    @Test
    void approveAllElements_callsRepository() {

        String oryId = "manager";

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        projectService.approveAllElements(
                oryId,
                1L);

        verify(projectRepository)
                .approveAllElementsInProject(1L);
    }

    @Test
    void approveAllElements_throwsWhenUnauthorized() {

        String oryId = "user";

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(false);

        assertThatThrownBy(() ->
                projectService.approveAllElements(
                        oryId,
                        1L))
                .isInstanceOf(AccessDeniedException.class);
    }
    @Test
    void finishActiveProject_setsStateToFinished() {

        String oryId = "manager";

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        projectService.finishActiveProject(
                oryId,
                1L);

        assertThat(project.getState())
                .isEqualTo(ProjectState.FINISHED);

        verify(projectRepository)
                .checkAllElementsAreFinished(1L);
    }
    @Test
    void disableProject_setsProjectState() {

        String oryId = "manager";

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndStates(
                1L,
                List.of(ProjectState.ACTIVE, ProjectState.REMOVED)))
                .thenReturn(Optional.of(project));

        projectService.disableProject(
                oryId,
                1L);

        assertThat(project.getState())
                .isEqualTo(ProjectState.DEACTIVATED);
    }
    @Test
    void enableProject_setsProjectState() {

        String oryId = "manager";

        project.setState(ProjectState.DEACTIVATED);

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndStates(
                1L,
                List.of(ProjectState.FINISHED, ProjectState.DEACTIVATED)))
                .thenReturn(Optional.of(project));

        projectService.enableProject(
                oryId,
                1L);

        assertThat(project.getState())
                .isEqualTo(ProjectState.ACTIVE);
    }
    @Test
    void removeProject_setsProjectState() {

        String oryId = "manager";

        project.setState(ProjectState.DEACTIVATED);

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.DEACTIVATED))
                .thenReturn(Optional.of(project));

        projectService.removeProject(
                oryId,
                1L);

        assertThat(project.getState())
                .isEqualTo(ProjectState.REMOVED);
    }
    @Test
    void deleteProject_removesPermissionsAndFiles() {

        String oryId = "manager";

        when(permService.checkPermission(
                "Project",
                "1",
                "editProject",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.REMOVED))
                .thenReturn(Optional.of(project));

        when(documentRepository.findAllObjectStorageKeysByProjectId(1L))
                .thenReturn(List.of("file1", "file2"));

        projectService.deleteProject(
                oryId,
                1L);

        verify(permService)
                .removeAllTuplesForSubject("1");

        verify(objectStorageService)
                .deleteFile("file1");

        verify(objectStorageService)
                .deleteFile("file2");

        verify(projectRepository)
                .deleteByIdAndState(
                        1L,
                        ProjectState.REMOVED);
    }
}