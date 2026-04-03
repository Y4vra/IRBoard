package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;

public record NonFunctionalRequirementDTO(
         Long id,
         String name,
         String description,
         String measurementUnit,
         String operator,
         Double thresholdValue,
         Double targetValue,
         Double actualValue,
         Long projectId
) implements Serializable {}