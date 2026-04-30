package com.y4vra.irboardbackend.application.dtos;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

public record FunctionalityDTO(
    Long id,

    @NotBlank(message = "The functionality name is compulsory")
    @Size(max = 150, message = "The name is too long")
    String name,
    String description,
    @Size(max = 10, message = "The label must not exceed 10 characters")
    String label,
    String state,
    @NotNull(message = "The project ID is mandatory")
    Long projectId,
    String priorityStyle
) implements Serializable{}
