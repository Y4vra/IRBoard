package com.y4vra.irboardbackend.application.dtos;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

public record FunctionalityDTO(
    Long id,

    @NotBlank(message = "El nombre de la funcionalidad es obligatorio")
    @Size(max = 150, message = "El nombre es demasiado largo")
    String name,
    @Size(max = 10, message = "El label no puede tener más de 10 caracteres")
    String label,
    String state,
    @NotNull(message = "El ID del proyecto es obligatorio")
    Long projectId
) implements Serializable{}
