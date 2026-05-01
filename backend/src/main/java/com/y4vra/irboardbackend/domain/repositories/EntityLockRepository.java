package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface EntityLockRepository {
    Optional<EntityLock> findByEntityTypeAndEntityId(String entityType, Long entityId);
    Optional<EntityLock> findByUser(User user);
    void deleteByUser(User user);
    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
    EntityLock save(EntityLock entityLock);
    List<EntityLock> findByProjectId(Long projectId);
    List<EntityLock> findByIsSystemWide();
}
