package com.y4vra.irboardbackend.application.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

public record UserDTO(
        Long id,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Name is required")
        @Size(max = 50)
        String name,

        @NotBlank(message = "Surname is required")
        @Size(max = 50)
        String surname,

        Boolean active,
        Boolean isAdmin,

        UserDTO modificatingUser,
        LocalDateTime startModificationDate,
        Boolean isLocked

) implements Serializable {}