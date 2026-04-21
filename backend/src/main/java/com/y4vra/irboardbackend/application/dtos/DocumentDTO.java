package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

public record DocumentDTO(
        Long id,
        String fileName,
        String mimeType,
        Long fileSize,
        Long projectId,

        // This is populated by the Service using the MinIO SDK.
        String accessUrl,

        UserDTO modificatingUser,
        LocalDateTime startModificationDate,
        Boolean isLocked
) implements Serializable {}