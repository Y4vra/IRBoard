package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public record FunctionalRequirementDTO(
        Long id,
        String name,
        String description,
        String priority,
        String stability,
        Long functionalityId,
        Long parentId,
        Float orderValue,
        String state,
        List<FunctionalRequirementDTO> children
) implements Serializable {}