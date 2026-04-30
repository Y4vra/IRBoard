package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.domain.model.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentDTO toDto(Document entity, String accessUrl) {
        if (entity == null) return null;

        return new DocumentDTO(
            entity.getId(),
            entity.getFileName(),
            entity.getMimeType(),
            entity.getFileSize(),
            entity.getProject() != null? entity.getProject().getId():null,
            accessUrl
        );
    }

    public Document toEntity(DocumentDTO dto) {
        if (dto == null) return null;

        Document entity = new Document();
        entity.setId(dto.id());
        entity.setFileName(dto.fileName());
        entity.setMimeType(dto.mimeType());
        entity.setFileSize(dto.fileSize());

        return entity;
    }
}