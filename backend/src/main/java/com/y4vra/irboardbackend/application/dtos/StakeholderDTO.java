package com.y4vra.irboardbackend.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDateTime;

public record StakeholderDTO (
     Long id,
     @NotBlank(message = "The stakeholder name is compulsory")
     @Size(max = 150, message = "The name is too long")
     String name,
     String description,
     String state,
     @NotNull(message = "The project ID is mandatory")
     Long projectId
) implements Serializable {}