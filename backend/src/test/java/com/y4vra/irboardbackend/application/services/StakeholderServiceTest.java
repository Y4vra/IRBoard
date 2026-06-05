package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.StakeholderMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
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
import java.util.Set;

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

    @Mock
    private FunctionalityService functionalityService;

    @Mock
    private EntityLockService entityLockService;

    @InjectMocks
    private StakeholderService stakeholderService;

    private Project project;
    private Stakeholder stakeholder;
    private User user;
    private StakeholderDTO stakeholderDTO;
    private final String oryId = "user-ory-123";
    private final long projectId = 1L;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(projectId);
        project.setState(ProjectState.ACTIVE);

        stakeholder = new Stakeholder();
        stakeholder.setId(5L);
        stakeholder.setName("End User");
        stakeholder.setDescription("Primary system user");
        stakeholder.setProject(project);
        stakeholder.setState(EntityState.PENDING_APPROVAL);

        user = new User();
        user.setOryId(oryId);

        stakeholderDTO = new StakeholderDTO(5L, "identifier", "End User", "Primary system user", EntityState.PENDING_APPROVAL.name(), projectId, List.of());
    }

    @Test
    void findStakeholdersOfProject_returnsStakeholdersWhenAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(stakeholderRepository.findAllByProjectIdNotRemoved(projectId)).thenReturn(List.of(stakeholder));
        when(stakeholderMapper.toDto(stakeholder)).thenReturn(stakeholderDTO);

        List<StakeholderDTO> result = stakeholderService.findStakeholdersNotRemovedOfProject(oryId, projectId);

        assertThat(result).hasSize(1).containsExactly(stakeholderDTO);
    }

    @Test
    void findStakeholdersOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> stakeholderService.findStakeholdersNotRemovedOfProject(oryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(stakeholderRepository, never()).findAllByProjectIdNotRemoved(any());
    }

    @Test
    void findStakeholdersOfProject_returnsEmptyListWhenNoneExist() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);

        List<StakeholderDTO> result = stakeholderService.findStakeholdersNotRemovedOfProject(oryId, projectId);

        assertThat(result).isEmpty();
        verify(stakeholderMapper, never()).toDto(any());
    }

    @Test
    void createStakeholder_savesAndReturnsDto() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE)).thenReturn(Optional.of(project));
        when(stakeholderRepository.save(any(Stakeholder.class))).thenReturn(stakeholder);
        when(stakeholderMapper.toDto(stakeholder)).thenReturn(stakeholderDTO);

        StakeholderDTO result = stakeholderService.createStakeholder(oryId,stakeholderDTO, projectId);

        assertThat(result).isEqualTo(stakeholderDTO);
        verify(stakeholderRepository).save(any(Stakeholder.class));
    }

    @Test
    void createStakeholder_setsProjectOnEntity() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE)).thenReturn(Optional.of(project));
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
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stakeholderService.createStakeholder(oryId,stakeholderDTO, projectId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Project not found");

        verify(stakeholderRepository, never()).save(any());
    }
    @Test
    void requestEdit_locksStakeholderWhenAuthorized() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(stakeholderRepository.findByIdAndProjectId(5L, projectId))
                .thenReturn(Optional.of(stakeholder));

        stakeholderService.requestEdit(user, projectId, 5L);

        verify(entityLockService).lock(stakeholder, user);
    }

    @Test
    void requestEdit_throwsAccessDeniedWhenUnauthorized() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(false);

        assertThatThrownBy(() ->
                stakeholderService.requestEdit(user, projectId, 5L))
                .isInstanceOf(AccessDeniedException.class);

        verify(entityLockService, never()).lock(any(), any());
    }
    @Test
    void patch_updatesStakeholderWhenLockedByUser() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(stakeholderRepository.findByIdAndProjectId(5L, projectId))
                .thenReturn(Optional.of(stakeholder));
        when(entityLockService.isLockedByUser(stakeholder, user)).thenReturn(true);
        when(stakeholderRepository.save(stakeholder)).thenReturn(stakeholder);
        when(stakeholderMapper.toDto(stakeholder)).thenReturn(stakeholderDTO);

        StakeholderDTO result =
                stakeholderService.patch(user, projectId, 5L, stakeholderDTO);

        assertThat(result).isEqualTo(stakeholderDTO);

        verify(stakeholderMapper).patchEntity(stakeholderDTO, stakeholder);
        verify(entityLockService).unlock(stakeholder, user);
        verify(stakeholderRepository).save(stakeholder);
    }

    @Test
    void patch_throwsWhenUserDoesNotHoldLock() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(stakeholderRepository.findByIdAndProjectId(5L, projectId))
                .thenReturn(Optional.of(stakeholder));
        when(entityLockService.isLockedByUser(stakeholder, user)).thenReturn(false);

        assertThatThrownBy(() ->
                stakeholderService.patch(user, projectId, 5L, stakeholderDTO))
                .isInstanceOf(com.y4vra.irboardbackend.domain.errors.LockableEntityException.class);

        verify(stakeholderRepository, never()).save(any());
    }
    @Test
    void approveStakeholders_updatesState() {
        List<Long> ids = List.of(5L);

        when(permService.checkPermission("Project", "1", "editProject", oryId))
                .thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));
        when(stakeholderRepository.allStakeholdersBelongToProject(projectId, ids))
                .thenReturn(true);

        stakeholderService.approveStakeholders(oryId, projectId, ids);

        verify(stakeholderRepository)
                .updateStateByIdsAndProject(
                        ids,
                        projectId,
                        EntityState.APPROVED,
                        EntityState.PENDING_APPROVAL
                );
    }
    @Test
    void disableStakeholders_setsStateToDeactivated() {
        List<Long> ids = List.of(5L);

        stakeholder.setState(EntityState.APPROVED);

        when(permService.checkPermission("Project", "1", "edit", oryId))
                .thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));
        when(stakeholderRepository.allStakeholdersBelongToProject(projectId, ids))
                .thenReturn(true);
        when(stakeholderRepository.findAllByIdsAndProjectIdAndState(
                eq(ids),
                eq(projectId),
                any(List.class)))
                .thenReturn(List.of(stakeholder));

        stakeholderService.disableStakeholders(oryId, projectId, ids);

        assertThat(stakeholder.getState()).isEqualTo(EntityState.DEACTIVATED);
    }
    @Test
    void enableStakeholders_setsStateToPendingApproval() {
        List<Long> ids = List.of(5L);

        stakeholder.setState(EntityState.DEACTIVATED);

        when(permService.checkPermission("Project", "1", "edit", oryId))
                .thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));
        when(stakeholderRepository.allStakeholdersBelongToProject(projectId, ids))
                .thenReturn(true);
        when(stakeholderRepository.findAllByIdsAndProjectIdAndState(
                ids,
                projectId,
                EntityState.DEACTIVATED))
                .thenReturn(List.of(stakeholder));

        stakeholderService.enableStakeholders(oryId, projectId, ids);

        assertThat(stakeholder.getState())
                .isEqualTo(EntityState.PENDING_APPROVAL);
    }
    @Test
    void removeStakeholders_setsStateToRemoved() {
        List<Long> ids = List.of(5L);

        stakeholder.setState(EntityState.DEACTIVATED);

        when(permService.checkPermission("Project", "1", "edit", oryId))
                .thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));
        when(stakeholderRepository.allStakeholdersBelongToProject(projectId, ids))
                .thenReturn(true);
        when(stakeholderRepository.findAllByIdsAndProjectIdAndState(
                ids,
                projectId,
                EntityState.DEACTIVATED))
                .thenReturn(List.of(stakeholder));

        stakeholderService.removeStakeholders(oryId, projectId, ids);

        assertThat(stakeholder.getState())
                .isEqualTo(EntityState.REMOVED);
    }
    @Test
    void deleteStakeholders_deletesRemovedStakeholders() {
        List<Long> ids = List.of(5L);

        when(permService.checkPermission("Project", "1", "edit", oryId))
                .thenReturn(true);
        when(projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));
        when(stakeholderRepository.allStakeholdersBelongToProject(projectId, ids))
                .thenReturn(true);

        stakeholderService.deleteStakeholders(oryId, projectId, ids);

        verify(stakeholderRepository)
                .deleteRemovedByIdsAndProject(ids, projectId);
    }
    @Test
    void findStakeholderById_returnsStakeholderWithObservers() {
        when(permService.checkPermission("Project", "1", "view", oryId))
                .thenReturn(true);

        when(functionalityService.getViewableFunctionalityIds(oryId, projectId))
                .thenReturn(Set.of());

        when(stakeholderRepository.findByIdAndProjectId(5L, projectId))
                .thenReturn(Optional.of(stakeholder));

        when(stakeholderRepository.findFilteredRequirementsForStakeholder(
                5L,
                Set.of()))
                .thenReturn(List.of());

        when(stakeholderMapper.toDtoWithObservers(
                eq(stakeholder),
                anyList()))
                .thenReturn(stakeholderDTO);

        StakeholderDTO result =
                stakeholderService.findStakeholderById(oryId, projectId, 5L);

        assertThat(result).isEqualTo(stakeholderDTO);
    }
}
