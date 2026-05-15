package com.y4vra.irboardbackend.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

public record FunctionalRequirementDTO(
        Long id,
        String entityIdentifier,
        @NotBlank(message = "The stakeholder name is compulsory")
        @Size(max = 150, message = "The name is too long")
        String name,
        String description,
        String priority,
        String stability,
        Long functionalityId,
        Long parentId,
        @NotNull(message = "The orderValue is mandatory")
        Long orderValue,
        String state,
        List<FunctionalRequirementDTO> children,
        List<StakeholderDTO> observedStakeholders,
        List<NonFunctionalRequirementDTO> observedNFRequirements,
        List<DocumentDTO> observedDocuments,
        List<FunctionalRequirementDTO> observedFRequirements
) implements Serializable {}