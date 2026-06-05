package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.mappers.UserMapper;
import com.y4vra.irboardbackend.application.ports.IdentityService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.model.projections.ProjectFunctionalityProjection;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.hibernate.mapping.Any;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PermissionService permService;

    @Mock
    private IdentityService identService;

    @Mock
    private EntityLockService entityLockService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private FunctionalityRepository functionalityRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDTO userDTO;
    private final Long userId = 1L;
    private final String oryId = "ory-id-abc";
    private final String adminOryId = "ory-admin-xyz";

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(userId);
        user.setOryId(oryId);
        user.setEmail("javier@example.com");
        user.setName("Javier");
        user.setSurname("Carrasco");
        user.setActive(true);
        user.setIsAdmin(false);

        userDTO = new UserDTO(userId, "javier@example.com", "Javier", "Carrasco", true, false,null,null,null);
    }

    @Test
    void findAll_returnsAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userMapper.toDto(user)).thenReturn(userDTO);

        List<UserDTO> result = userService.findAll();

        assertThat(result).hasSize(1).containsExactly(userDTO);
    }

    @Test
    void findAll_returnsEmptyListWhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserDTO> result = userService.findAll();

        assertThat(result).isEmpty();
    }

    @Test
    void findById_returnsUserWhenExists() {
        List<String> managedProjects = List.of("1");
        List<String> editableFunctionalities = List.of("10");
        List<String> viewableFunctionalities = List.of("10");

        ProjectFunctionalityProjection projection = mock(ProjectFunctionalityProjection.class);
        when(projection.getProjectId()).thenReturn(1L);
        when(projection.getFuncId()).thenReturn("10");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(permService.getAuthorizedObjects(oryId, "Project", "managers")).thenReturn(managedProjects);
        when(permService.getAuthorizedObjects(oryId, "Functionality", "engineers"))
                .thenReturn(editableFunctionalities)
                .thenReturn(viewableFunctionalities);
        when(functionalityRepository.groupByIdsGroupedByProject(List.of(10L)))
                .thenReturn(List.of(projection));
        when(userMapper.toDtoWithPermissions(eq(user), eq(managedProjects), any(), any()))
                .thenReturn(userDTO);

        UserDTO result = userService.findById(userId);

        assertThat(result).isEqualTo(userDTO);
        verify(permService).getAuthorizedObjects(oryId, "Project", "managers");
        verify(permService, times(2)).getAuthorizedObjects(oryId, "Functionality", "engineers");
        verify(functionalityRepository, times(2)).groupByIdsGroupedByProject(List.of(10L));
        verify(userMapper).toDtoWithPermissions(eq(user), eq(managedProjects), any(), any());
    }

    @Test
    void findById_throwsEntityNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(userId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void inviteUser_basicUser_createsIdentitySendsCodeAndPersists() {
        UserDTO dto = new UserDTO(null, "new@example.com", "New", "User", null, false,null,null,null);
        User mappedUser = new User();
        mappedUser.setEmail("new@example.com");

        when(identService.createIdentity("new@example.com", "New", "User", false)).thenReturn(oryId);
        when(identService.sendInvitationCode("new@example.com")).thenReturn("flow-abc");
        when(userMapper.toEntity(dto)).thenReturn(mappedUser);

        UserDTO result = userService.inviteUser(dto, adminOryId);

        assertThat(result).isEqualTo(dto);
        verify(identService).createIdentity("new@example.com", "New", "User", false);
        verify(identService).sendInvitationCode("new@example.com");
        verify(permService, never()).grantPermission(any(), any(), any(), any());
        verify(userRepository).save(argThat(u ->
                u.getOryId().equals(oryId) &&
                u.getPendingActivationToken().equals("flow-abc")
        ));
    }

    @Test
    void inviteUser_adminUser_createsKetoAdminRelation() {
        UserDTO dto = new UserDTO(null, "admin@example.com", "Admin", "User", null, true,null,null,null);
        User mappedUser = new User();
        mappedUser.setEmail("admin@example.com");

        when(identService.createIdentity("admin@example.com", "Admin", "User", true)).thenReturn(oryId);
        when(identService.sendInvitationCode("admin@example.com")).thenReturn("flow-xyz");
        when(userMapper.toEntity(dto)).thenReturn(mappedUser);

        userService.inviteUser(dto, adminOryId);

        verify(permService).grantPermission("System", "main", "admins", oryId);
    }

    @Test
    void updateUser_updatesNameAndSurnameAndPersists() {
        UserDTO updateDTO = new UserDTO(userId, "javier@example.com", "Javi", "Updated", true, false,null,null,null);
        UserDTO updatedResult = new UserDTO(userId, "javier@example.com", "Javi", "Updated", true, false,null,null,null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(updatedResult);

        UserDTO result = userService.updateUser(userId, updateDTO);

        assertThat(result.name()).isEqualTo("Javi");
        assertThat(result.surname()).isEqualTo("Updated");
        verify(userRepository).save(user);
    }

    @Test
    void updateUser_throwsEntityNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(userId, userDTO))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).save(any());
    }

    @Test
    void generateNewInvite_sendsNewCodeAndUpdatesToken() {
        user.setPendingActivationToken("old-flow");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(identService.sendInvitationCode(user.getEmail())).thenReturn("new-flow");
        when(userMapper.toDto(user)).thenReturn(userDTO);

        userService.generateNewInvite(userId);

        assertThat(user.getPendingActivationToken()).isEqualTo("new-flow");
        verify(identService).sendInvitationCode("javier@example.com");
    }

    @Test
    void generateNewInvite_throwsEntityNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.generateNewInvite(userId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void activateInvitedUser_completesActivationAndPersists() {
        user.setPendingActivationToken("flow-token");
        String email = "javier@example.com";
        String code = "recovery-code";
        String password = "securepassword1234567";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDTO);

        UserDTO result = userService.activateInvitedUser(email, code, password);

        assertThat(result).isEqualTo(userDTO);
        verify(identService).validateRecoveryCode(email, code, "flow-token");
        verify(identService).setPassword(oryId, password, user);
        assertThat(user.getActive()).isTrue();
        assertThat(user.getPendingActivationToken()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    void activateInvitedUser_throwsEntityNotFoundWhenEmailNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.activateInvitedUser("unknown@example.com", "code", "pass"))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("USER_NOT_FOUND");
    }

    @Test
    void getUserAuthenticatedDto_delegatesToMapper() {
        when(userMapper.toDto(user)).thenReturn(userDTO);

        UserDTO result = userService.getUserAuthenticatedDto(user);

        assertThat(result).isEqualTo(userDTO);
        verify(userMapper).toDto(user);
    }
    @Test
    void findAllForProject_returnsManagersAndNonManagers() {
        User manager = new User();
        manager.setOryId("manager");

        User regular = new User();
        regular.setOryId("regular");

        UserDTO managerDto = mock(UserDTO.class);
        UserDTO regularDto = mock(UserDTO.class);

        when(permService.getSubjectsForObject("Project", "1", "managers"))
                .thenReturn(List.of("manager"));

        when(userRepository.findByOryIdIn(List.of("manager")))
                .thenReturn(List.of(manager));

        when(userRepository.findByOryIdNotIn(List.of("manager")))
                .thenReturn(List.of(regular));

        when(userMapper.toDto(manager)).thenReturn(managerDto);
        when(userMapper.toDto(regular)).thenReturn(regularDto);

        Map<String, List<UserDTO>> result = userService.findAllForProject(1L);

        assertThat(result.get("managers")).containsExactly(managerDto);
        assertThat(result.get("not_managers")).containsExactly(regularDto);
    }
    @Test
    void deleteUser_removesIdentityAndPermissions() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUser(userId);

        verify(userRepository).deleteById(userId);
        verify(identService).deleteIdentity(oryId);
        verify(permService).removeAllTuplesForSubject(oryId);
    }
    @Test
    void deleteUser_throwsWhenUserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(userId))
                .isInstanceOf(EntityNotFoundException.class);

        verify(userRepository, never()).deleteById(any());
    }
    @Test
    void requestEdit_locksUser() {
        User editor = new User();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.requestEdit(userId, editor);

        verify(entityLockService).lock(user, editor);
    }
    @Test
    void requestEdit_throwsWhenUserNotFound() {
        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                userService.requestEdit(userId, new User()))
                .isInstanceOf(EntityNotFoundException.class);
    }
    @Test
    void patch_updatesAndSavesUser() {
        User editor = new User();

        UserDTO patch = new UserDTO(
                null,
                null,
                "Updated",
                "Surname",
                null,
                null,
                null,
                null,
                null
        );

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(entityLockService.isLockedByUser(user, editor))
                .thenReturn(true);

        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDTO);

        UserDTO result = userService.patch(userId, patch, editor);

        assertThat(result).isEqualTo(userDTO);

        verify(userMapper).patchEntity(patch, user);
        verify(userRepository).save(user);
    }
    @Test
    void patch_throwsWhenUserDoesNotOwnLock() {
        User editor = new User();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(entityLockService.isLockedByUser(user, editor))
                .thenReturn(false);

        assertThatThrownBy(() ->
                userService.patch(userId, userDTO, editor))
                .isInstanceOf(LockableEntityException.class);
    }
    @Test
    void findAllForProjectsFunctionality_returnsGroupedUsers() {

        User manager = new User();
        manager.setOryId("manager");

        User engineer = new User();
        engineer.setOryId("engineer");

        User stakeholder = new User();
        stakeholder.setOryId("stakeholder");

        User other = new User();
        other.setOryId("other");

        UserDTO managerDto = new UserDTO(
                1L,
                "manager@mail.com",
                "Manager",
                "User",
                true,
                false,
                null,
                null,
                null
        );

        UserDTO engineerDto = new UserDTO(
                2L,
                "engineer@mail.com",
                "Engineer",
                "User",
                false,
                false,
                null,
                null,
                null
        );

        UserDTO stakeholderDto = new UserDTO(
                3L,
                "stakeholder@mail.com",
                "Stakeholder",
                "User",
                false,
                false,
                null,
                null,
                null
        );

        UserDTO otherDto = new UserDTO(
                4L,
                "other@mail.com",
                "Other",
                "User",
                false,
                false,
                null,
                null,
                null
        );

        when(permService.checkPermission(
                "Project",
                "1",
                "linkProjectUsers",
                oryId))
                .thenReturn(true);

        when(permService.getSubjectsForObject("Project", "1", "managers"))
                .thenReturn(List.of("manager"));

        when(permService.getSubjectsForObject("Functionality", "10", "engineers"))
                .thenReturn(List.of("engineer"));

        when(permService.getSubjectsForObject("Functionality", "10", "stakeholders"))
                .thenReturn(List.of("stakeholder"));

        when(userRepository.findByOryIdIn(List.of("manager")))
                .thenReturn(List.of(manager));

        when(userRepository.findByOryIdIn(List.of("engineer")))
                .thenReturn(List.of(engineer));

        when(userRepository.findByOryIdIn(List.of("stakeholder")))
                .thenReturn(List.of(stakeholder));

        when(userRepository.findByOryIdNotIn(any()))
                .thenReturn(List.of(other));

        when(userMapper.toDto(manager)).thenReturn(managerDto);
        when(userMapper.toDto(engineer)).thenReturn(engineerDto);
        when(userMapper.toDto(stakeholder)).thenReturn(stakeholderDto);
        when(userMapper.toDto(other)).thenReturn(otherDto);

        Map<String, List<UserDTO>> result =
                userService.findAllForProjectsFunctionality(oryId, 1L, 10L);

        assertThat(result.get("project_managers"))
                .containsExactly(managerDto);

        assertThat(result.get("requirement_engineers"))
                .containsExactly(engineerDto);

        assertThat(result.get("stakeholders"))
                .containsExactly(stakeholderDto);

        assertThat(result.get("others"))
                .containsExactly(otherDto);
    }
    @Test
    void findAllForProjectsFunctionality_throwsWhenUnauthorized() {
        when(permService.checkPermission(
                "Project",
                "1",
                "linkProjectUsers",
                oryId))
                .thenReturn(false);

        assertThatThrownBy(() ->
                userService.findAllForProjectsFunctionality(
                        oryId,
                        1L,
                        10L))
                .isInstanceOf(AccessDeniedException.class);
    }
    @Test
    void linkUserToProject_grantsManagerPermission() {

        when(projectRepository.findByIdAndState(1L, ProjectState.ACTIVE))
                .thenReturn(Optional.of(mock(Project.class)));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.linkUserToProject(1L, userId);

        verify(permService)
                .grantPermission(
                        "Project",
                        "1",
                        "managers",
                        oryId);
    }
    @Test
    void unlinkUserFromProject_revokesManagerPermission() {

        when(projectRepository.findByIdAndState(1L, ProjectState.ACTIVE))
                .thenReturn(Optional.of(mock(Project.class)));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.unlinkUserFromProject(1L, userId);

        verify(permService)
                .revokePermission(
                        "Project",
                        "1",
                        "managers",
                        oryId);
    }
    @Test
    void linkUserToProjectsFunctionality_grantsPermission() {

        when(permService.checkPermission(
                "Project",
                "1",
                "linkProjectUsers",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(1L, ProjectState.ACTIVE))
                .thenReturn(Optional.of(mock(Project.class)));

        when(functionalityRepository.findByIdAndProjectId(10L, 1L))
                .thenReturn(Optional.of(mock(com.y4vra.irboardbackend.domain.model.Functionality.class)));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.linkUserToProjectsFunctionality(
                oryId,
                1L,
                10L,
                userId,
                "engineers"
        );

        verify(permService)
                .grantPermission(
                        "Functionality",
                        "10",
                        "engineers",
                        oryId);
    }
    @Test
    void unlinkUserFromProjectsFunctionality_revokesPermission() {

        when(permService.checkPermission(
                "Project",
                "1",
                "linkProjectUsers",
                oryId))
                .thenReturn(true);

        when(projectRepository.findByIdAndState(1L, ProjectState.ACTIVE))
                .thenReturn(Optional.of(mock(Project.class)));

        when(functionalityRepository.findByIdAndProjectId(10L, 1L))
                .thenReturn(Optional.of(mock(com.y4vra.irboardbackend.domain.model.Functionality.class)));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.unlinkUserFromProjectsFunctionality(
                oryId,
                1L,
                10L,
                userId,
                "engineers"
        );

        verify(permService)
                .revokePermission(
                        "Functionality",
                        "10",
                        "engineers",
                        oryId);
    }
}
