package com.y4vra.irboardbackend.application.dtos;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO implements Serializable {
    private Long id;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private long projectId;

    // This is populated by the Service using the MinIO SDK.
    private String accessUrl;
}