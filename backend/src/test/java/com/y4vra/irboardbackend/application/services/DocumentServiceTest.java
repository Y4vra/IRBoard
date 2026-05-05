package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.ObjectStorageException;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentMapper documentMapper;

    @Mock
    private PermissionService permService;

    @Mock
    private ObjectStorageService objStorageService;

    @Mock
    private FunctionalityService functionalityService;

    @InjectMocks
    private DocumentService documentService;

    @Mock
    private MultipartFile multipartFile;

    private Document document;
    private DocumentDTO documentDTO;
    private DocumentDTO inputDto;
    private final String oryId = "user-ory-123";
    private final Long projectId = 1L;
    private final Long documentId = 10L;
    private final String presignedUrl = "https://minio/presigned/spec.pdf";
    private final Set<Long> viewableFunctionalities = Set.of(1L, 2L);

    @BeforeEach
    void setUp() {
        Project project = new Project();
        project.setId(projectId);

        document = new Document();
        document.setId(documentId);
        document.setFileName("spec.pdf");
        document.setMimeType("application/pdf");
        document.setFileSize(1024L);
        document.setProject(project);

        documentDTO = new DocumentDTO(
                documentId, "spec.pdf", "application/pdf", 1024L, projectId, presignedUrl, List.of()
        );
        inputDto = new DocumentDTO(
                null, "spec.pdf", "application/pdf", 1024L, projectId, null, List.of()
        );
    }

    // ─── findDocumentsOfProject ───────────────────────────────────────────────

    @Test
    void findDocumentsOfProject_returnsDocumentsWithPresignedUrls() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(documentRepository.findAllByProjectId(projectId)).thenReturn(List.of(document));
        when(objStorageService.getDownloadUrl("spec.pdf")).thenReturn(presignedUrl);
        when(documentMapper.toDtoDetailed(document, presignedUrl)).thenReturn(documentDTO);

        List<DocumentDTO> result = documentService.findDocumentsOfProject(oryId, projectId);

        assertThat(result).hasSize(1).containsExactly(documentDTO);
    }

    @Test
    void findDocumentsOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.findDocumentsOfProject(oryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(documentRepository, never()).findAllByProjectId(any());
    }

    // ─── findDocumentById ─────────────────────────────────────────────────────

    @Test
    void findDocumentById_returnsDocumentWithPresignedUrlAndObservers() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(functionalityService.getViewableFunctionalityIds(oryId, projectId))
                .thenReturn(viewableFunctionalities);
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(objStorageService.getDownloadUrl("spec.pdf")).thenReturn(presignedUrl);
        when(documentRepository.findFilteredRequirementsForDocument(documentId, viewableFunctionalities))
                .thenReturn(List.of());
        when(documentMapper.toDtoDetailedWithObservers(document, presignedUrl, List.of()))
                .thenReturn(documentDTO);

        DocumentDTO result = documentService.findDocumentById(oryId, projectId, documentId);

        assertThat(result).isEqualTo(documentDTO);
    }

    @Test
    void findDocumentById_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.findDocumentById(oryId, projectId, documentId))
                .isInstanceOf(AccessDeniedException.class);

        verify(documentRepository, never()).findById(any());
    }

    @Test
    void findDocumentById_throwsEntityNotFoundWhenDocumentDoesNotExist() {
        when(permService.checkPermission("Project", "1", "view", oryId)).thenReturn(true);
        when(functionalityService.getViewableFunctionalityIds(oryId, projectId))
                .thenReturn(viewableFunctionalities);
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.findDocumentById(oryId, projectId, documentId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Document not found");
    }

    // ─── uploadDocument ───────────────────────────────────────────────────────

    @Test
    void uploadDocument_uploadsFileAndSavesDocumentWithKetoRelations() throws Exception {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(multipartFile.getInputStream()).thenReturn(InputStream.nullInputStream());
        when(multipartFile.getSize()).thenReturn(1024L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(documentMapper.toEntity(inputDto)).thenReturn(document);
        when(documentRepository.save(document)).thenReturn(document);
        when(objStorageService.getDownloadUrl(anyString())).thenReturn(presignedUrl);
        when(documentMapper.toDtoDetailed(eq(document), eq(presignedUrl))).thenReturn(documentDTO);

        DocumentDTO result = documentService.uploadDocument(multipartFile, inputDto, projectId, oryId);

        assertThat(result).isEqualTo(documentDTO);
        verify(objStorageService).uploadFile(matches(projectId +"/"+projectId + "-DOC-\\d{8}-\\d{6}-[A-Z0-9]{4}"), any(), eq(1024L), eq("application/pdf"));
    }

    @Test
    void uploadDocument_throwsAccessDeniedWhenNotAuthorized() {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.uploadDocument(multipartFile, inputDto, projectId, oryId))
                .isInstanceOf(AccessDeniedException.class);

        verify(objStorageService, never()).uploadFile(any(), any(), anyLong(), any());
        verify(documentRepository, never()).save(any());
        verify(permService, never()).grantPermission(any(), any(), any(), any());
    }

    @Test
    void uploadDocument_throwsWhenStorageFails() throws Exception {
        when(permService.checkPermission("Project", "1", "edit", oryId)).thenReturn(true);
        when(multipartFile.getInputStream()).thenReturn(InputStream.nullInputStream());
        when(multipartFile.getSize()).thenReturn(1024L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(documentMapper.toEntity(inputDto)).thenReturn(document);
        doThrow(new RuntimeException("MinIO unreachable"))
                .when(objStorageService).uploadFile(any(), any(), anyLong(), any());

        assertThatThrownBy(() -> documentService.uploadDocument(multipartFile, inputDto, projectId, oryId))
                .isInstanceOf(ObjectStorageException.class);

        verify(documentRepository, never()).save(any());
        verify(permService, never()).grantPermission(any(), any(), any(), any());
    }
}
