package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.domain.model.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentDTO toDto(Document entity) {
        if (entity == null) return null;

        DocumentDTO dto = new DocumentDTO();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setMimeType(entity.getMimeType());
        dto.setFileSize(entity.getFileSize());
        dto.setProjectId(entity.getProject().getId());

        return dto;
    }

    public Document toEntity(DocumentDTO dto) {
        if (dto == null) return null;

        Document entity = new Document();
        entity.setId(dto.getId());
        entity.setFileName(dto.getFileName());
        entity.setMimeType(dto.getMimeType());
        entity.setFileSize(dto.getFileSize());

        return entity;
    }
}