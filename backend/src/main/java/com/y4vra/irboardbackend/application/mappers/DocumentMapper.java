package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DocumentMapper {

    public DocumentDTO toDto(Document entity) {
        if (entity == null) return null;

        return new DocumentDTO(
            entity.getId(),
            entity.getFileName(),
            entity.getMimeType(),
            entity.getFileSize(),
            entity.getProject() != null? entity.getProject().getId():null,
            null,
                List.of()
        );
    }
    public DocumentDTO toDtoDetailed(Document entity, String accessUrl) {
        if (entity == null) return null;

        return new DocumentDTO(
                entity.getId(),
                entity.getFileName(),
                entity.getMimeType(),
                entity.getFileSize(),
                entity.getProject() != null? entity.getProject().getId():null,
                accessUrl,
                List.of()
        );
    }
    public DocumentDTO toDtoDetailedWithObservers(Document entity, String accessUrl,List<Requirement> observers) {
        if (entity == null) return null;

        return new DocumentDTO(
                entity.getId(),
                entity.getFileName(),
                entity.getMimeType(),
                entity.getFileSize(),
                entity.getProject() != null? entity.getProject().getId():null,
                accessUrl,
                SummaryMapper.toRequirementSummaries(observers)
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

    public List<DocumentDTO> toDtoList(List<Document> docs) {
        return docs.stream().map(this::toDto).collect(Collectors.toList());
    }
}