package com.y4vra.irboardbackend.application.dtos;

import com.y4vra.irboardbackend.application.dtos.summaries.RequirementSummary;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

public record DocumentDTO(
    Long id,
    @NotBlank(message = "The stakeholder name is compulsory")
    @Size(max = 150, message = "The name is too long")
    String fileName,
    String mimeType,
    Long fileSize,
    @NotNull(message = "The project ID is mandatory")
    Long projectId,

    // This is populated by the Service using the MinIO SDK.
    String accessUrl,

    List<RequirementSummary> observers
) implements Serializable {}