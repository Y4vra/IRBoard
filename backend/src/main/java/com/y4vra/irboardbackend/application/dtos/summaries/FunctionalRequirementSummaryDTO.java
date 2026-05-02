package com.y4vra.irboardbackend.application.dtos.summaries;

import java.io.Serializable;

public record FunctionalRequirementSummaryDTO(
        Long id,
        String name,
        String description,
        String state,
        Long functionalityId,
        String requirementType
) implements RequirementSummary, Serializable {}