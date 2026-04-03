package com.y4vra.irboardbackend.application.dtos;



import java.io.Serializable;

public record FunctionalityDTO(
    Long id,
    String name,
    String label,
    String state,
    Long projectId
) implements Serializable{}
