package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LabelConflictException;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FunctionalityServiceTest {

    @Mock
    private FunctionalityRepository functionalityRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EntityLockService entityLockService;

    @Mock
    private FunctionalityMapper functionalityMapper;

    @Mock
    private PermissionService permService;

    @InjectMocks
    private FunctionalityService functionalityService;

    private Project project;
    private Functionality functionality;
    private FunctionalityDTO functionalityDTO;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);
        project.setState(ProjectState.ACTIVE);

        functionality = new Functionality();
        functionality.setId(10L);
        functionality.setName("User Management");
        functionality.setLabel("UM");
        functionality.setState(FunctionalityState.ACTIVE);
        functionality.setProject(project);

        functionalityDTO = new FunctionalityDTO(10L, "identifier", "User Management","description", "UM", "ACTIVE", 1L,List.of());
    }

    @Test
    void findFunctionalitiesOfProjectForUser_categorizesFunctionalitiesCorrectly() {
        String oryId = "user-ory-123";
        long projectId = 1L;

        // Mocking Keto response for Edit and View permissions
        when(permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)).thenReturn(false);
        when(permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)).thenReturn(false);
        when(permService.checkPermission("Functionality", "10", "editRequirements", oryId)).thenReturn(true); // Can edit 10
        when(permService.checkPermission("Functionality", "11", "editRequirements", oryId)).thenReturn(false); // Cannot edit 11
        when(permService.checkPermission("Functionality", "11", "viewRequirements", oryId)).thenReturn(true); // Can view 11
        when(permService.checkPermission("Functionality", "12", "editRequirements", oryId)).thenReturn(false); // Cannot edit 12
        when(permService.checkPermission("Functionality", "12", "viewRequirements", oryId)).thenReturn(false); // Cannot view 12

        // Setup functionalities for this project
        Functionality funcEdit = new Functionality(); funcEdit.setId(10L); funcEdit.setProject(project);
        Functionality funcView = new Functionality(); funcView.setId(11L); funcView.setProject(project);
        Functionality funcNone = new Functionality(); funcNone.setId(12L); funcNone.setProject(project);

        when(functionalityRepository.findByStateNotAndProjectId(FunctionalityState.REMOVED,projectId)).thenReturn(List.of(funcEdit, funcView, funcNone));

        // Setup DTOs
        FunctionalityDTO dtoEdit = new FunctionalityDTO(10L, "identifier", "Edit","description", "E", "PENDING_APPROVAL", 1L,List.of());
        FunctionalityDTO dtoView = new FunctionalityDTO(11L, "identifier", "View","description", "V", "PENDING_APPROVAL", 1L,List.of());
        FunctionalityDTO dtoNone = new FunctionalityDTO(12L, "identifier", "None","description", "N", "PENDING_APPROVAL", 1L,List.of());

        when(functionalityMapper.toDto(funcEdit)).thenReturn(dtoEdit);
        when(functionalityMapper.toDto(funcView)).thenReturn(dtoView);
        when(functionalityMapper.toDto(funcNone)).thenReturn(dtoNone);

        // EXECUTE
        Map<String, List<FunctionalityDTO>> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, projectId);

        // ASSERT
        assertThat(result).containsKeys("edit", "view", "none");
        assertThat(result.get("edit")).containsExactly(dtoEdit);
        assertThat(result.get("view")).containsExactly(dtoView);
        assertThat(result.get("none")).containsExactly(dtoNone);
    }

    @Test
    void findFunctionalitiesOfProjectForUser_filtersByProjectId() {
        String oryId = "user-ory-123";

        Functionality correctProject = new Functionality();
        correctProject.setId(10L);
        correctProject.setProject(project); // ID 1L

        Functionality wrongProject = new Functionality();
        wrongProject.setId(20L);
        Project otherP = new Project(); otherP.setId(999L);
        wrongProject.setProject(otherP);

        when(permService.checkPermission("Project", String.valueOf(1L), "edit", oryId)).thenReturn(false);
        when(permService.checkPermission("Project", String.valueOf(1L), "view", oryId)).thenReturn(false);
        when(permService.checkPermission("Functionality", "10", "editRequirements", oryId)).thenReturn(true);


        when(functionalityRepository.findByStateNotAndProjectId(FunctionalityState.REMOVED,1L)).thenReturn(List.of(correctProject));
        when(functionalityMapper.toDto(correctProject)).thenReturn(functionalityDTO);

        Map<String, List<FunctionalityDTO>> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, 1L);

        // Should only contain the one from project 1
        assertThat(result.get("edit")).hasSize(1);
        assertThat(result.get("edit").getFirst().id()).isEqualTo(10L);
        verify(functionalityMapper, never()).toDto(wrongProject);
    }
    @Test
    void findRemovedFunctionalitiesOfProject_returnsDtos() {
        when(permService.checkPermission(
                "Project", "1", "editProject", "ory"))
                .thenReturn(true);

        functionality.setState(FunctionalityState.REMOVED);

        when(functionalityRepository.findByStateAndProjectId(
                FunctionalityState.REMOVED,
                1L))
                .thenReturn(List.of(functionality));

        when(functionalityMapper.toDto(functionality))
                .thenReturn(functionalityDTO);

        List<FunctionalityDTO> result =
                functionalityService.findRemovedFunctionalitiesOfProject(
                        "ory",
                        1L
                );

        assertThat(result).containsExactly(functionalityDTO);
    }
    @Test
    void findRemovedFunctionalitiesOfProject_throwsAccessDenied() {
        when(permService.checkPermission(
                "Project", "1", "editProject", "ory"))
                .thenReturn(false);

        assertThatThrownBy(() ->
                functionalityService.findRemovedFunctionalitiesOfProject(
                        "ory",
                        1L))
                .isInstanceOf(AccessDeniedException.class);
    }
    @Test
    void findFunctionalityById_returnsDto() {
        when(permService.checkPermission(
                "Functionality",
                "10",
                "viewRequirements",
                "ory"))
                .thenReturn(true);

        when(functionalityRepository.findByIdAndProjectId(10L, 1L))
                .thenReturn(Optional.of(functionality));

        when(functionalityMapper.toDto(functionality))
                .thenReturn(functionalityDTO);

        FunctionalityDTO result =
                functionalityService.findFunctionalityById(
                        "ory",
                        1L,
                        10L);

        assertThat(result).isEqualTo(functionalityDTO);
    }
    @Test
    void findFunctionalityById_throwsWhenMissing() {
        when(permService.checkPermission(
                "Functionality",
                "10",
                "viewRequirements",
                "ory"))
                .thenReturn(true);

        when(functionalityRepository.findByIdAndProjectId(10L, 1L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                functionalityService.findFunctionalityById(
                        "ory",
                        1L,
                        10L))
                .isInstanceOf(EntityNotFoundException.class);
    }
    @Test
    void getViewableFunctionalityIds_returnsAuthorizedIds() {
        when(permService.getAuthorizedObjects(
                "ory",
                "Functionality",
                "stakeholders"))
                .thenReturn(List.of("1", "2"));

        when(permService.getAuthorizedObjects(
                "ory",
                "Functionality",
                "engineers"))
                .thenReturn(List.of("3"));

        when(permService.getAuthorizedObjects(
                "ory",
                "Project",
                "managers"))
                .thenReturn(List.of());

        when(permService.getAuthorizedObjects(
                "ory",
                "System",
                "admins"))
                .thenReturn(List.of());

        assertThat(
                functionalityService.getViewableFunctionalityIds(
                        "ory",
                        1L))
                .containsExactlyInAnyOrder(1L,2L,3L);
    }
    @Test
    void getViewableFunctionalityIds_managerGetsAllProjectFunctionalities() {
        when(permService.getAuthorizedObjects(any(), eq("Functionality"), any()))
                .thenReturn(List.of());

        when(permService.getAuthorizedObjects(
                "ory",
                "Project",
                "managers"))
                .thenReturn(List.of("1"));

        when(functionalityRepository.findIdsByProjectId(1L))
                .thenReturn(Set.of(10L,11L));

        Set<Long> result =
                functionalityService.getViewableFunctionalityIds(
                        "ory",
                        1L);

        assertThat(result)
                .containsExactlyInAnyOrder(10L,11L);
    }
    @Test
    void createFunctionality_createsEntity() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        Functionality entity = new Functionality();
        entity.setLabel("UM");

        when(functionalityMapper.toEntity(functionalityDTO))
                .thenReturn(entity);

        when(functionalityRepository.save(any()))
                .thenReturn(entity);

        when(functionalityMapper.toDto(entity))
                .thenReturn(functionalityDTO);

        FunctionalityDTO result =
                functionalityService.createFunctionality(
                        functionalityDTO,
                        1L,
                        "ory");

        assertThat(result).isEqualTo(functionalityDTO);

        verify(functionalityRepository).save(any());
    }
    @Test
    void createFunctionality_throwsWhenProjectMismatch() {
        FunctionalityDTO dto =
                new FunctionalityDTO(
                        1L,
                        "id",
                        "name",
                        "desc",
                        "LBL",
                        "ACTIVE",
                        999L,
                        List.of());

        assertThatThrownBy(() ->
                functionalityService.createFunctionality(
                        dto,
                        1L,
                        "ory"))
                .isInstanceOf(IllegalArgumentException.class);
    }
    @Test
    void createFunctionality_throwsLabelConflict() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        Functionality entity = new Functionality();
        entity.setLabel("UM");

        when(functionalityMapper.toEntity(functionalityDTO))
                .thenReturn(entity);

        when(functionalityRepository.save(any()))
                .thenThrow(DataIntegrityViolationException.class);

        assertThatThrownBy(() ->
                functionalityService.createFunctionality(
                        functionalityDTO,
                        1L,
                        "ory"))
                .isInstanceOf(LabelConflictException.class);
    }
    @Test
    void requestEdit_acquiresLock() {
        User user = new User();
        user.setOryId("ory");

        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository.findByIdAndProjectId(
                10L,
                1L))
                .thenReturn(Optional.of(functionality));

        functionalityService.requestEdit(
                user,
                1L,
                10L);

        verify(entityLockService)
                .lock(functionality, user);
    }
    @Test
    void patch_updatesEntity() {
        User user = new User();
        user.setOryId("ory");

        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository.findByIdAndProjectId(
                10L,
                1L))
                .thenReturn(Optional.of(functionality));

        when(entityLockService.isLockedByUser(
                functionality,
                user))
                .thenReturn(true);

        when(functionalityRepository.save(functionality))
                .thenReturn(functionality);

        when(functionalityMapper.toDto(functionality))
                .thenReturn(functionalityDTO);

        FunctionalityDTO result =
                functionalityService.patch(
                        user,
                        1L,
                        10L,
                        functionalityDTO);

        assertThat(result).isEqualTo(functionalityDTO);

        verify(functionalityMapper)
                .patchEntity(functionalityDTO, functionality);

        verify(entityLockService)
                .unlock(functionality, user);
    }
    @Test
    void patch_throwsWhenUserDoesNotHoldLock() {
        User user = new User();
        user.setOryId("ory");

        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository.findByIdAndProjectId(
                10L,
                1L))
                .thenReturn(Optional.of(functionality));

        when(entityLockService.isLockedByUser(
                functionality,
                user))
                .thenReturn(false);

        assertThatThrownBy(() ->
                functionalityService.patch(
                        user,
                        1L,
                        10L,
                        functionalityDTO))
                .isInstanceOf(LockableEntityException.class);
    }
    @Test
    void disableFunctionality_setsDeactivatedState() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository
                .findByIdAndProjectIdAndStateNot(
                        10L,
                        1L,
                        FunctionalityState.DEACTIVATED))
                .thenReturn(Optional.of(functionality));

        functionalityService.disableFunctionality(
                "ory",
                1L,
                10L);

        assertThat(functionality.getState())
                .isEqualTo(FunctionalityState.DEACTIVATED);
    }
    @Test
    void enableFunctionality_setsActiveState() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository
                .findByIdAndProjectIdAndState(
                        10L,
                        1L,
                        FunctionalityState.DEACTIVATED))
                .thenReturn(Optional.of(functionality));

        functionalityService.enableFunctionality(
                "ory",
                1L,
                10L);

        assertThat(functionality.getState())
                .isEqualTo(FunctionalityState.ACTIVE);
    }
    @Test
    void removeFunctionality_setsRemovedState() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(functionalityRepository
                .findByIdAndProjectIdAndState(
                        10L,
                        1L,
                        FunctionalityState.DEACTIVATED))
                .thenReturn(Optional.of(functionality));

        functionalityService.removeFunctionality(
                "ory",
                1L,
                10L);

        assertThat(functionality.getState())
                .isEqualTo(FunctionalityState.REMOVED);
    }
    @Test
    void deleteFunctionality_deletesEntity() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(functionalityRepository
                .deleteFunctionalityAndRequirementsInState(
                        1L,
                        10L,
                        FunctionalityState.REMOVED))
                .thenReturn(1);

        functionalityService.deleteFunctionality(
                "ory",
                1L,
                10L);
    }
    @Test
    void deleteFunctionality_throwsWhenNothingDeleted() {
        when(permService.checkPermission(
                "Project","1","editProject","ory"))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(
                1L,
                ProjectState.ACTIVE))
                .thenReturn(Optional.of(project));

        when(functionalityRepository
                .deleteFunctionalityAndRequirementsInState(
                        1L,
                        10L,
                        FunctionalityState.REMOVED))
                .thenReturn(0);

        assertThatThrownBy(() ->
                functionalityService.deleteFunctionality(
                        "ory",
                        1L,
                        10L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
