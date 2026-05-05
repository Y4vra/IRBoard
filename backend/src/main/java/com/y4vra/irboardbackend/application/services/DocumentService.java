package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.ObjectStorageException;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final PermissionService permService;
    private final ObjectStorageService objStorageService;
    private final FunctionalityService functionalityService;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           PermissionService permService, ObjectStorageService objStorageService, FunctionalityService functionalityService) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.permService = permService;
        this.objStorageService = objStorageService;
        this.functionalityService = functionalityService;
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findDocumentsOfProject(String oryId, Long projectId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentRepository.findAllByProjectId(projectId).stream()
                .map(doc -> {
                    String url = objStorageService.getDownloadUrl(doc.getS3Key());
                    return documentMapper.toDtoDetailed(doc, url);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDTO findDocumentById(String oryId, Long projectId, Long documentId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);
        Set<Long> viewableFunctionalities = functionalityService.getViewableFunctionalityIds(oryId, projectId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        String url = objStorageService.getDownloadUrl(document.getS3Key());
        List<Requirement> observers = documentRepository
                .findFilteredRequirementsForDocument(documentId, viewableFunctionalities);
        return documentMapper.toDtoDetailedWithObservers(document, url,observers);
    }

    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file, DocumentDTO dto, Long projectId, String oryId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to upload documents for this project");
        }

        Document document = documentMapper.toEntity(dto);
        document.setProjectId(projectId);
        EntitySlugGenerator.setSlug(document, projectId); // generates slug e.g. "1-DOC-20260505-113422-A3F9"

        // Reuse the slug as the S3 key — it's already unique
        String objectKey = projectId + "/" + document.getEntityIdentifier();//error, debería ser projectId/file.getOriginalFilename()
        document.setS3Key(objectKey);

        try {
            objStorageService.uploadFile(
                    objectKey,
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType()
            );
        } catch (Exception e) {
            throw new ObjectStorageException("Failed to upload file to storage", e);
        }

        Document saved = documentRepository.save(document);

        String url = objStorageService.getDownloadUrl(objectKey);
        return documentMapper.toDtoDetailed(saved, url);
    }

    @Transactional
    public List<DocumentDTO> findObservableDocumentsForRequirement(String oryId, Long projectId, Long requirementId) {
        if(!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view documents of this project");
        }
        return documentMapper.toDtoList(documentRepository.findObservableDocumentsForRequirement(projectId,requirementId));
    }
}