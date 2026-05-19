package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.ObjectStorageException;
import com.y4vra.irboardbackend.domain.model.Associations;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
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
    private final ProjectRepository projectRepository;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           PermissionService permService, ObjectStorageService objStorageService, FunctionalityService functionalityService, ProjectRepository projectRepository) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.permService = permService;
        this.objStorageService = objStorageService;
        this.functionalityService = functionalityService;
        this.projectRepository = projectRepository;
    }

    private void checkEditPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to update documents for this project");
        }
    }
    private void checkViewPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view documents for this project");
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> findDocumentsNotRemovedOfProject(String oryId, Long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return documentRepository.findAllByProjectIdNotRemoved(projectId).stream()
                .map(doc -> {
                    String url = objStorageService.getDownloadUrl(doc.getS3Key());
                    return documentMapper.toDtoDetailed(doc, url);
                })
                .toList();
    }
    @Transactional(readOnly = true)
    public List<DocumentDTO> findDocumentsRemovedOfProject(String oryId, Long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return documentRepository.findAllByProjectIdRemoved(projectId).stream()
                .map(doc -> {
                    String url = objStorageService.getDownloadUrl(doc.getS3Key());
                    return documentMapper.toDtoDetailed(doc, url);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDTO findDocumentById(String oryId, Long projectId, Long documentId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        Set<Long> viewableFunctionalities = functionalityService.getViewableFunctionalityIds(oryId, projectId);
        Document document = documentRepository.findByIdAndProjectId(documentId,projectId)
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
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new EntityNotFoundException("Project not found"));
        Document document = documentMapper.toEntity(dto);
        document.setState(EntityState.PENDING_APPROVAL);
        Associations.link(project,document);
        EntitySlugGenerator.setSlug(document, projectId); // generates slug e.g. "1-DOC-20260505-113422-A3F9"

        // Reuse the slug as the S3 key — it's already unique
        String objectKey = projectId + "/" + document.getEntityIdentifier();
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

    @Transactional
    public DocumentDTO updateDocument(MultipartFile file, DocumentDTO dto, Long projectId, Long documentId, String oryId) {
        checkEditPermission(oryId,String.valueOf(projectId));

        Document existing = documentRepository.findByIdAndProjectId(documentId,projectId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));
        existing.checkCanBeModified();

        try {
            objStorageService.deleteFile(existing.getS3Key());
        } catch (Exception e) {
            throw new ObjectStorageException("Failed to delete old file from storage", e);
        }

        String objectKey = projectId + "/" + existing.getEntityIdentifier();

        try {
            objStorageService.uploadFile(
                    objectKey,
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType()
            );
        } catch (Exception e) {
            throw new ObjectStorageException("Failed to upload new file to storage", e);
        }

        documentMapper.patch(existing, dto);
        existing.setS3Key(objectKey);

        existing.setState(EntityState.PENDING_APPROVAL);
        Document saved = documentRepository.save(existing);
        saved.notifyObservers();

        String url = objStorageService.getDownloadUrl(objectKey);
        return documentMapper.toDtoDetailed(saved, url);
    }

    @Transactional
    public void approveDocuments(String oryId, Long projectId, List<Long> documentIds) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "editProject", oryId)) {
            throw new AccessDeniedException("User not authorized to perform this action on this project");
        }
        if (!documentRepository.allDocumentsBelongToProject(projectId,documentIds)) {
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        documentRepository.updateStateByIdsAndProject(documentIds,projectId, EntityState.APPROVED,EntityState.PENDING_APPROVAL);
    }
    @Transactional
    public void disableDocuments(String oryId, Long projectId, List<Long> documentIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!documentRepository.allDocumentsBelongToProject(projectId,documentIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        documentRepository.updateStateByIdsAndProject(documentIds,projectId, EntityState.DEACTIVATED,List.of(EntityState.PENDING_APPROVAL,EntityState.APPROVED,EntityState.REMOVED));
    }
    @Transactional
    public void enableDocuments(String oryId, Long projectId, List<Long> documentIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!documentRepository.allDocumentsBelongToProject(projectId,documentIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        documentRepository.updateStateByIdsAndProject(documentIds,projectId, EntityState.PENDING_APPROVAL,EntityState.DEACTIVATED);
    }
    @Transactional
    public void removeDocuments(String oryId, Long projectId, List<Long> documentIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!documentRepository.allDocumentsBelongToProject(projectId,documentIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        documentRepository.updateStateByIdsAndProject(documentIds,projectId, EntityState.REMOVED,EntityState.DEACTIVATED);
    }
    @Transactional
    public void deleteDocuments(String oryId, Long projectId, List<Long> documentIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!documentRepository.allDocumentsBelongToProject(projectId,documentIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        documentRepository.deleteRemovedByIdsAndProject(documentIds,projectId);
    }
}