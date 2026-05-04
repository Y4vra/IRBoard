package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;

public record DocumentDTO(
        Long id,
        String fileName,
        String mimeType,
        Long fileSize,
        Long projectId,

        // This is populated by the Service using the MinIO SDK.
        String accessUrl
) implements Serializable {}