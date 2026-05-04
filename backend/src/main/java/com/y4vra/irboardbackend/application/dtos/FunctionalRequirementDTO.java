package com.y4vra.irboardbackend.application.dtos;

import com.y4vra.irboardbackend.domain.model.Requirement;

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
        List<FunctionalRequirementDTO> children,
        List<StakeholderDTO> observedStakeholders,
        List<NonFunctionalRequirementDTO> observedNFRequirements,
        List<DocumentDTO> observedDocuments,
        List<FunctionalRequirementDTO> observedFRequirements
) implements Serializable {}