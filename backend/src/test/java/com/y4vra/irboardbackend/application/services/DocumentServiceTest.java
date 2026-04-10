package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.mappers.DocumentMapper;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import com.y4vra.irboardbackend.infrastructure.clients.MinioService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

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
    private KetoClient ketoClient;

    @Mock
    private MinioService minioService;

    @InjectMocks
    private DocumentService documentService;

    private Document document;
    private DocumentDTO documentDTO;
    private final String OryId = "user-ory-123";
    private final Long projectId = 1L;
    private final Long documentId = 10L;
    private final String presignedUrl = "https://minio/presigned/spec.pdf";

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

        documentDTO = new DocumentDTO(documentId, "spec.pdf", "application/pdf", 1024L, projectId, presignedUrl);
    }

    @Test
    void findDocumentsOfProject_returnsDocumentsWithPresignedUrls() {
        when(ketoClient.check("Project", "1", "view", OryId)).thenReturn(true);
        when(documentRepository.findAllByProjectId(projectId)).thenReturn(List.of(document));
        when(minioService.getPresignedUrl(document.getFileName())).thenReturn(presignedUrl);
        when(documentMapper.toDto(document, presignedUrl)).thenReturn(documentDTO);

        List<DocumentDTO> result = documentService.findDocumentsOfProject(OryId, projectId);

        assertThat(result).hasSize(1).containsExactly(documentDTO);
        verify(minioService).getPresignedUrl("spec.pdf");
    }

    @Test
    void findDocumentsOfProject_throwsAccessDeniedWhenNotAuthorized() {
        when(ketoClient.check("Project", "1", "view", OryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.findDocumentsOfProject(OryId, projectId))
                .isInstanceOf(AccessDeniedException.class);

        verify(documentRepository, never()).findAllByProjectId(any());
    }

    @Test
    void findById_returnsDocumentWithPresignedUrl() {
        when(ketoClient.check("Project", "1", "view", OryId)).thenReturn(true);
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(minioService.getPresignedUrl(document.getFileName())).thenReturn(presignedUrl);
        when(documentMapper.toDto(document, presignedUrl)).thenReturn(documentDTO);

        DocumentDTO result = documentService.findById(OryId, projectId, documentId);

        assertThat(result).isEqualTo(documentDTO);
    }

    @Test
    void findById_throwsAccessDeniedWhenNotAuthorized() {
        when(ketoClient.check("Project", "1", "view", OryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.findById(OryId, projectId, documentId))
                .isInstanceOf(AccessDeniedException.class);

        verify(documentRepository, never()).findById(any());
    }

    @Test
    void findById_throwsEntityNotFoundWhenDocumentDoesNotExist() {
        when(ketoClient.check("Project", "1", "view", OryId)).thenReturn(true);
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.findById(OryId, projectId, documentId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Document not found");
    }

    @Test
    void uploadDocument_savesDocumentAndCreatesKetoRelations() {
        DocumentDTO inputDto = new DocumentDTO(null, "spec.pdf", "application/pdf", 1024L, projectId, null);
        when(ketoClient.check("Project", "1", "write", OryId)).thenReturn(true);
        when(documentMapper.toEntity(inputDto)).thenReturn(document);
        when(documentRepository.save(document)).thenReturn(document);
        when(minioService.getPresignedUrl(document.getFileName())).thenReturn(presignedUrl);
        when(documentMapper.toDto(document, presignedUrl)).thenReturn(documentDTO);

        DocumentDTO result = documentService.uploadDocument(inputDto, projectId, OryId);

        assertThat(result).isEqualTo(documentDTO);
        verify(ketoClient).createRelation("Document", "10", "parents", "Project:1");
        verify(ketoClient).createRelation("Document", "10", "owners", OryId);
    }

    @Test
    void uploadDocument_throwsAccessDeniedWhenNotAuthorized() {
        DocumentDTO inputDto = new DocumentDTO(null, "spec.pdf", "application/pdf", 1024L, projectId, null);
        when(ketoClient.check("Project", "1", "write", OryId)).thenReturn(false);

        assertThatThrownBy(() -> documentService.uploadDocument(inputDto, projectId, OryId))
                .isInstanceOf(AccessDeniedException.class);

        verify(documentRepository, never()).save(any());
        verify(ketoClient, never()).createRelation(any(), any(), any(), any());
    }
}
