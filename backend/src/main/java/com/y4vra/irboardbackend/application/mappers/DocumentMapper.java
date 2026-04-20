package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.domain.model.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    private UserMapper userMapper = new UserMapper();

    public DocumentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public DocumentDTO toDto(Document entity, String accessUrl) {
        if (entity == null) return null;
        UserDTO modifyingUser = userMapper.toDto(entity.getModifyingUser());

        return new DocumentDTO(
            entity.getId(),
            entity.getFileName(),
            entity.getMimeType(),
            entity.getFileSize(),
            entity.getProject() != null? entity.getProject().getId():null,
            accessUrl,
            modifyingUser,
            entity.getStartModificationDate(),
            entity.isLocked()
        );
    }

    public Document toEntity(DocumentDTO dto) {
        if (dto == null) return null;

        Document entity = new Document();
        entity.setId(dto.id());
        entity.setFileName(dto.fileName());
        entity.setMimeType(dto.mimeType());
        entity.setFileSize(dto.fileSize());
        entity.setModifyingUser(userMapper.toEntity(dto.modificatingUser()));
        entity.setStartModificationDate(dto.startModificationDate());

        return entity;
    }
}