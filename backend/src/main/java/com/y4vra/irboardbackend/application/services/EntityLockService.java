package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.EntityLockDTO;
import com.y4vra.irboardbackend.application.mappers.EntityLockMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.interfaces.Lockable;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.interfaces.ProjectElement;
import com.y4vra.irboardbackend.domain.model.interfaces.ProjectIndependentElement;
import com.y4vra.irboardbackend.domain.repositories.EntityLockRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EntityLockService {

    private static final int EXPIRATION_HOURS = 12;

    private final EntityLockRepository lockRepository;
    private final PermissionService permissionService;
    private final EntityLockMapper lockMapper;

    public EntityLockService(EntityLockRepository lockRepository, PermissionService permissionService, EntityLockMapper lockMapper) {
        this.lockRepository = lockRepository;
        this.permissionService = permissionService;
        this.lockMapper = lockMapper;
    }

    public void lock(Lockable entity, User user) {
        String type = entity.getClass().getSimpleName();
        Long id = entity.getId();

        lockRepository.findByEntityTypeAndEntityId(type, id)
                .ifPresent(existing -> {
                    if (!isExpired(existing) && !existing.getUser().equals(user)) {
                        throw new LockableEntityException("Entity is locked by another user");
                    }
                    lockRepository.deleteByEntityTypeAndEntityId(type, id);
                });

        lockRepository.deleteByUser(user);

        EntityLock newLock = new EntityLock();
        newLock.setUser(user);
        newLock.setEntityType(type);
        newLock.setEntityId(id);
        newLock.setLockedAt(LocalDateTime.now());
        entity.setLockBounds(newLock);
        lockRepository.save(newLock);
    }

    public void unlock(Lockable entity, User user) {
        String type = entity.getClass().getSimpleName();
        Long id = entity.getId();

        lockRepository.findByEntityTypeAndEntityId(type, id)
                .ifPresent(lock -> {
                    if (!lock.getUser().equals(user)) {
                        throw new LockableEntityException("Cannot unlock: locked by another user");
                    }
                    lockRepository.deleteByEntityTypeAndEntityId(type, id);
                });
    }

    public List<EntityLockDTO> findLocksForProject(String oryId, Long projectId){
        if (!permissionService.checkPermission("Project", String.valueOf(projectId), "view", oryId)){
            throw new AccessDeniedException("You do not have permission to view this project's locks");
        }

        return lockRepository.findByProjectId(projectId).stream()
                .map(lockMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<EntityLockDTO> findSystemLocks(){
        return lockRepository.findByIsSystemWide().stream()
                .map(lockMapper::toDto)
                .collect(Collectors.toList());
    }

    public boolean isLocked(Lockable entity) {
        return lockRepository
                .findByEntityTypeAndEntityId(entity.getClass().getSimpleName(), entity.getId())
                .filter(lock -> !isExpired(lock))
                .isPresent();
    }

    public boolean isLockedByUser(Lockable entity, User user) {
        return lockRepository
                .findByEntityTypeAndEntityId(entity.getClass().getSimpleName(), entity.getId())
                .filter(lock -> !isExpired(lock))
                .map(lock -> lock.getUser().equals(user))
                .orElse(false);
    }

    private boolean isExpired(EntityLock lock) {
        return lock.getLockedAt().isBefore(LocalDateTime.now().minusHours(EXPIRATION_HOURS));
    }
}
