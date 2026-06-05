package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.EntityLockDTO;
import com.y4vra.irboardbackend.application.mappers.EntityLockMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.interfaces.Lockable;
import com.y4vra.irboardbackend.domain.repositories.EntityLockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EntityLockServiceTest {
    @Mock
    private EntityLockRepository lockRepository;

    @Mock
    private PermissionService permissionService;

    @Mock
    private EntityLockMapper lockMapper;

    @InjectMocks
    private EntityLockService service;

    @Mock
    private Lockable lockable;

    @Mock
    private User user;

    @Mock
    private User otherUser;

    private EntityLock entityLock;

    @BeforeEach
    void setUp() {
        entityLock = new EntityLock();
        entityLock.setEntityType("Requirement");
        entityLock.setEntityId(1L);
        entityLock.setUser(user);
        entityLock.setLockedAt(LocalDateTime.now());
    }

    @Test
    void lock_createsNewLock() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.empty());

        service.lock(lockable, user);

        verify(lockRepository).deleteByUser(user);
        verify(lockRepository).save(any(EntityLock.class));
        verify(lockable).setLockBounds(any(EntityLock.class));
    }

    @Test
    void lock_replacesExpiredLock() {
        entityLock.setLockedAt(LocalDateTime.now().minusHours(13));

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        service.lock(lockable, user);

        verify(lockRepository)
                .deleteByEntityTypeAndEntityId(
                        lockable.getClass().getSimpleName(),
                        1L);

        verify(lockRepository).save(any(EntityLock.class));
    }

    @Test
    void lock_replacesExistingLockOwnedBySameUser() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        service.lock(lockable, user);

        verify(lockRepository)
                .deleteByEntityTypeAndEntityId(
                        lockable.getClass().getSimpleName(),
                        1L);

        verify(lockRepository).save(any());
    }

    @Test
    void lock_throwsWhenLockedByAnotherUser() {
        entityLock.setUser(otherUser);

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThatThrownBy(() -> service.lock(lockable, user))
                .isInstanceOf(LockableEntityException.class)
                .hasMessageContaining("locked by another user");

        verify(lockRepository, never()).save(any());
    }

    @Test
    void unlock_removesOwnLock() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        service.unlock(lockable, user);

        verify(lockRepository)
                .deleteByEntityTypeAndEntityId(
                        lockable.getClass().getSimpleName(),
                        1L);
    }

    @Test
    void unlock_throwsWhenLockedByAnotherUser() {
        entityLock.setUser(otherUser);

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThatThrownBy(() -> service.unlock(lockable, user))
                .isInstanceOf(LockableEntityException.class)
                .hasMessageContaining("Cannot unlock");
    }

    @Test
    void unlock_doesNothingWhenLockMissing() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.empty());

        service.unlock(lockable, user);

        verify(lockRepository, never())
                .deleteByEntityTypeAndEntityId(any(), anyLong());
    }

    @Test
    void findLocksForProject_returnsDtos() {
        EntityLockDTO dto = mock(EntityLockDTO.class);

        when(permissionService.checkPermission(
                "Project",
                "1",
                "view",
                "ory"))
                .thenReturn(true);

        when(lockRepository.findByProjectId(1L))
                .thenReturn(List.of(entityLock));

        when(lockMapper.toDto(entityLock))
                .thenReturn(dto);

        List<EntityLockDTO> result =
                service.findLocksForProject("ory", 1L);

        assertThat(result).containsExactly(dto);
    }

    @Test
    void findLocksForProject_throwsWhenUnauthorized() {
        when(permissionService.checkPermission(
                "Project",
                "1",
                "view",
                "ory"))
                .thenReturn(false);

        assertThatThrownBy(() ->
                service.findLocksForProject("ory", 1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void findSystemLocks_returnsDtos() {
        EntityLockDTO dto = mock(EntityLockDTO.class);

        when(lockRepository.findByIsSystemWide())
                .thenReturn(List.of(entityLock));

        when(lockMapper.toDto(entityLock))
                .thenReturn(dto);

        List<EntityLockDTO> result = service.findSystemLocks();

        assertThat(result).containsExactly(dto);
    }

    @Test
    void isLocked_returnsTrueForActiveLock() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThat(service.isLocked(lockable)).isTrue();
    }

    @Test
    void isLocked_returnsFalseForExpiredLock() {
        entityLock.setLockedAt(LocalDateTime.now().minusHours(13));

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThat(service.isLocked(lockable)).isFalse();
    }

    @Test
    void isLocked_returnsFalseWhenMissing() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.empty());

        assertThat(service.isLocked(lockable)).isFalse();
    }

    @Test
    void isLockedByUser_returnsTrueForOwner() {
        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThat(service.isLockedByUser(lockable, user)).isTrue();
    }

    @Test
    void isLockedByUser_returnsFalseForDifferentUser() {
        entityLock.setUser(otherUser);

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThat(service.isLockedByUser(lockable, user)).isFalse();
    }

    @Test
    void isLockedByUser_returnsFalseForExpiredLock() {
        entityLock.setLockedAt(LocalDateTime.now().minusHours(13));

        when(lockable.getId()).thenReturn(1L);

        when(lockRepository.findByEntityTypeAndEntityId(
                lockable.getClass().getSimpleName(),
                1L))
                .thenReturn(Optional.of(entityLock));

        assertThat(service.isLockedByUser(lockable, user)).isFalse();
    }
}
