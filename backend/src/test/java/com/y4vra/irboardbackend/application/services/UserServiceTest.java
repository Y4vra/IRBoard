package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.mappers.UserMapper;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import com.y4vra.irboardbackend.infrastructure.clients.KratosClient;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
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
    private KetoClient ketoClient;

    @Mock
    private KratosClient kratosClient;

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

        userDTO = new UserDTO(userId, "javier@example.com", "Javier", "Carrasco", true, false);
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
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(userDTO);

        UserDTO result = userService.findById(userId);

        assertThat(result).isEqualTo(userDTO);
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
        UserDTO dto = new UserDTO(null, "new@example.com", "New", "User", null, false);
        User mappedUser = new User();
        mappedUser.setEmail("new@example.com");

        when(kratosClient.createIdentity("new@example.com", "New", "User", false)).thenReturn(oryId);
        when(kratosClient.sendInvitationCode("new@example.com")).thenReturn("flow-abc");
        when(userMapper.toEntity(dto)).thenReturn(mappedUser);

        UserDTO result = userService.inviteUser(dto, adminOryId);

        assertThat(result).isEqualTo(dto);
        verify(kratosClient).createIdentity("new@example.com", "New", "User", false);
        verify(kratosClient).sendInvitationCode("new@example.com");
        verify(ketoClient, never()).createRelation(any(), any(), any(), any());
        verify(userRepository).save(argThat(u ->
                u.getOryId().equals(oryId) &&
                u.getPendingActivationToken().equals("flow-abc")
        ));
    }

    @Test
    void inviteUser_adminUser_createsKetoAdminRelation() {
        UserDTO dto = new UserDTO(null, "admin@example.com", "Admin", "User", null, true);
        User mappedUser = new User();
        mappedUser.setEmail("admin@example.com");

        when(kratosClient.createIdentity("admin@example.com", "Admin", "User", true)).thenReturn(oryId);
        when(kratosClient.sendInvitationCode("admin@example.com")).thenReturn("flow-xyz");
        when(userMapper.toEntity(dto)).thenReturn(mappedUser);

        userService.inviteUser(dto, adminOryId);

        verify(ketoClient).createRelation("System", "main", "admins", oryId);
    }

    @Test
    void updateUser_updatesNameAndSurnameAndPersists() {
        UserDTO updateDTO = new UserDTO(userId, "javier@example.com", "Javi", "Updated", true, false);
        UserDTO updatedResult = new UserDTO(userId, "javier@example.com", "Javi", "Updated", true, false);

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
        when(kratosClient.sendInvitationCode(user.getEmail())).thenReturn("new-flow");
        when(userMapper.toDto(user)).thenReturn(userDTO);

        userService.generateNewInvite(userId);

        assertThat(user.getPendingActivationToken()).isEqualTo("new-flow");
        verify(kratosClient).sendInvitationCode("javier@example.com");
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
        verify(kratosClient).validateRecoveryCode(email, code, "flow-token");
        verify(kratosClient).setPasswordByAdmin(oryId, password, user);
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
    void deactivateUser_setsInactiveAndDisablesKratosIdentity() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deactivateUser(userId);

        assertThat(user.getActive()).isFalse();
        verify(userRepository).save(user);
        verify(kratosClient).disableIdentity(oryId);
    }

    @Test
    void deactivateUser_throwsEntityNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deactivateUser(userId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(kratosClient, never()).disableIdentity(any());
    }

    @Test
    void getUserAuthenticatedDto_delegatesToMapper() {
        when(userMapper.toDto(user)).thenReturn(userDTO);

        UserDTO result = userService.getUserAuthenticatedDto(user);

        assertThat(result).isEqualTo(userDTO);
        verify(userMapper).toDto(user);
    }
}
