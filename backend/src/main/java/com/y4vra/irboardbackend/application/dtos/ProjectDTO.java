package com.y4vra.irboardbackend.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

public record ProjectDTO(
        Long id,

        @NotBlank(message = "Project name is required")
        @Size(max = 100)
        String name,
        @NotBlank(message = "Project description is required")
        @Size(max = 2000)
        String description,
        @Pattern(regexp = "TERNARY|MOSCOW", message = "Priority style must be TERNARY or MOSCOW")
        String priorityStyle,
        String state,
        Map<String,Long> stakeholderStats,
        Map<String,Long> nonFunctionalRequirementStats,
        Map<String,Map<String,Long>> functionalRequirementStats
) implements Serializable {}