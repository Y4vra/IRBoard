package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final KetoClient ketoClient;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           KetoClient ketoClient) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.ketoClient = ketoClient;
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findDocumentsOfProject(String oryId, Long projectId) {
        boolean hasProjectAccess = ketoClient.check("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentRepository.findAllByProjectId(projectId).stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDTO findById(String oryId, Long projectId, Long id) {
        boolean hasProjectAccess = ketoClient.check("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentRepository.findById(id)
                .map(documentMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
    }

    @Transactional
    public DocumentDTO uploadDocument(DocumentDTO dto, Long projectId, String oryId) {
        boolean hasProjectAccess = ketoClient.check("Project", String.valueOf(projectId), "write", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to upload documents for this project");
        }
        Document document = documentMapper.toEntity(dto);
        Document saved = documentRepository.save(document);

        ketoClient.createRelation("Document", String.valueOf(saved.getId()), "parents", "Project:" + projectId);
        ketoClient.createRelation("Document", String.valueOf(saved.getId()), "owners", oryId);

        return documentMapper.toDto(saved);
    }
}