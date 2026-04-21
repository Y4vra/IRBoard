package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

public record StakeholderDTO (
     Long id,
     String name,
     String description,
     long projectId,

     UserDTO modificatingUser,
     LocalDateTime startModificationDate,
     Boolean isLocked
) implements Serializable {}