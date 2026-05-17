package com.y4vra.irboardbackend.application.dtos;

public record SearchResultDTO(
        Long id,
        String name,
        String description,
        String type,
        Long projectId,
        Long functionalityId,
        String entityIdentifier
) {}

