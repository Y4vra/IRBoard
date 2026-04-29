package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public record NonFunctionalRequirementDTO(
        Long id,
        String name,
        String description,
        String state,
        String measurementUnit,
        String operator,
        Double thresholdValue,
        Double targetValue,
        Double actualValue,
        Long projectId,
        Long parentId,
        List<NonFunctionalRequirementDTO> children,

         UserDTO modificatingUser,
        LocalDateTime startModificationDate,
        Boolean isLocked
) implements Serializable {}