package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

public record NonFunctionalRequirementDTO(
         Long id,
         String name,
         String description,
         String state,
         String measurementUnit,
         String operator,
         Double thresholdValue,
         Double targetValue,
         Double actualValue,
         Long projectId,

         UserDTO modificatingUser,
         LocalDateTime startModificationDate,
         Boolean isLocked
) implements Serializable {}