package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

public record FunctionalRequirementDTO(
        Long id,
        String name,
        String description,
        String priority,
        String stability,
        Long functionalityId,
        Long projectId,

        UserDTO modificatingUser,
        LocalDateTime startModificationDate,
        Boolean isLocked
) implements Serializable {}