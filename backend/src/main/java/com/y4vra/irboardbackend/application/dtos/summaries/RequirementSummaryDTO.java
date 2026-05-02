package com.y4vra.irboardbackend.application.dtos.summaries;

import java.io.Serializable;

public record RequirementSummaryDTO(
        Long id,
        String name,
        String description,
        String state,
        String requirementType  // "FR" or "NFR"
) implements RequirementSummary, Serializable {}
