package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.Lockable;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.EntityLockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class EntityLockService {

    private static final int EXPIRATION_HOURS = 12;

    private final EntityLockRepository lockRepository;

    public EntityLockService(EntityLockRepository lockRepository) {
        this.lockRepository = lockRepository;
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
