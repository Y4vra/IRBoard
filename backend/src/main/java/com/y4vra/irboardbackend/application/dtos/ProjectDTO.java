package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;

public record ProjectDTO(
        Long id,
        String name,
        String description,
        String state,
        int requirementCount
) implements Serializable {}