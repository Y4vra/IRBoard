package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.EntityLockRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaEntityLockRepository extends JpaRepository<EntityLock, Long> {
    Optional<EntityLock> findByEntityTypeAndEntityId(String entityType, Long entityId);
    Optional<EntityLock> findByUser(User user);
    void deleteByUser(User user);
    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
    List<EntityLock> findByProjectId(Long projectId);
    List<EntityLock> findBySystemWide(Boolean systemWide);
}

@Component
public class EntityLockRepositoryImpl implements EntityLockRepository {

    private final JpaEntityLockRepository jpaRepository;

    public EntityLockRepositoryImpl(JpaEntityLockRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<EntityLock> findByEntityTypeAndEntityId(String entityType, Long entityId) {
        return jpaRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public Optional<EntityLock> findByUser(User user) {
        return jpaRepository.findByUser(user);
    }

    @Override
    public void deleteByUser(User user) {
        jpaRepository.deleteByUser(user);
    }

    @Override
    public void deleteByEntityTypeAndEntityId(String entityType, Long entityId) {
        jpaRepository.deleteByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public EntityLock save(EntityLock entityLock) {
        return jpaRepository.save(entityLock);
    }

    @Override
    public List<EntityLock> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId);
    }

    @Override
    public List<EntityLock> findByIsSystemWide() {
        return jpaRepository.findBySystemWide(true);
    }
}