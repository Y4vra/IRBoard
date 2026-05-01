package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.EntityLockDTO;
import com.y4vra.irboardbackend.domain.model.EntityLock;
import org.springframework.stereotype.Component;

@Component
public class EntityLockMapper {
    public EntityLockDTO toDto(EntityLock lock) {
        if (lock == null) return null;

        return new EntityLockDTO(
            lock.getUser().getName(),
            lock.getEntityType(),
            lock.getEntityId(),
            lock.getLockedAt()
        );
    }
}
