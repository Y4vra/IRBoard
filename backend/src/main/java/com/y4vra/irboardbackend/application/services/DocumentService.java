package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final PermissionService permService;
    private final ObjectStorageService objStorageService;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           PermissionService permService,ObjectStorageService objStorageService) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.permService = permService;
        this.objStorageService = objStorageService;
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findDocumentsOfProject(String oryId, Long projectId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentRepository.findAllByProjectId(projectId).stream()
                .map(doc -> {
                    String url = objStorageService.getDownloadUrl(doc.getFileName());
                    return documentMapper.toDtoDetailed(doc, url);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDTO findDocumentById(String oryId, Long projectId, Long id) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        String url = objStorageService.getDownloadUrl(document.getFileName());
        return documentMapper.toDtoDetailed(document, url);
    }

    @Transactional
    public DocumentDTO uploadDocument(DocumentDTO dto, Long projectId, String oryId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "write", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to upload documents for this project");
        }
        Document document = documentMapper.toEntity(dto);
        document.setProjectId(projectId);
        EntitySlugGenerator.setSlug(document,projectId);
        Document saved = documentRepository.save(document);

        permService.grantPermission("Document", String.valueOf(saved.getId()), "parents", "Project:" + projectId);
        permService.grantPermission("Document", String.valueOf(saved.getId()), "owners", oryId);

        String url = objStorageService.getDownloadUrl(saved.getFileName());
        return documentMapper.toDtoDetailed(saved, url);
    }

    @Transactional
    public List<DocumentDTO> findObservableDocumentsForRequirement(String oryId, Long projectId, Long requirementId) {
        if(!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentMapper.toDtoList(documentRepository.findObservableDocumentsForRequirement(requirementId));
    }
}