package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

public record EntityLockDTO(
    String username,
    String entityType,
    Long entityId,
    LocalDateTime lockedAt
) implements Serializable {}
