package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class DocumentControllerTest extends IrBoardBaseTest {

    @Override
    void setUp() {
        // no extra seed data required beyond what IrBoardBaseTest provides
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{documentId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getDocumentById_returnsDocument_whenUserHasViewPermission() {
        Document doc = documentRepository.save(
                buildDocument("report", "report-s3key", EntityState.PENDING_APPROVAL, activeProject));

        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/" + doc.getId(),
                DocumentDTO.class,
                activeProject.getId(), doc.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isEqualTo(doc.getId());
    }

    @Test
    void getDocumentById_returns403_whenUserLacksPermission() {
        Document doc = documentRepository.save(
                buildDocument("report", "report-s3key", EntityState.PENDING_APPROVAL, activeProject));

        // no allowView call — ketoClient returns false by default

        var response = get(
                REQUIREMENT_ENGINEER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/" + doc.getId(),
                DocumentDTO.class,
                activeProject.getId(), doc.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void getDocumentById_returns404_whenDocumentDoesNotExist() {
        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/12321",
                DocumentDTO.class,
                activeProject.getId(), 999_999L
        );

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /observable/{requirementId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getObservableDocumentsForRequirement_returnsLinkedDocuments() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("func", FunctionalityState.ACTIVE, activeProject));
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.PENDING_APPROVAL, activeProject, f));

        Document linked = documentRepository.save(
                buildDocument("linked-doc", "linked-s3key", EntityState.PENDING_APPROVAL, activeProject));
        Document unlinked = documentRepository.save(
                buildDocument("unlinked-doc", "unlinked-s3key", EntityState.PENDING_APPROVAL, activeProject));

        // Associate linked document with the requirement via the Associations helper
        Associations.observe(fr, linked);
        frRepository.save(fr);
        documentRepository.save(linked);

        allowView(REQUIREMENT_ENGINEER_1_ORY_ID, activeProject.getId());

        var response = get(
                REQUIREMENT_ENGINEER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/observable/"+fr.getId(),
                new ParameterizedTypeReference<List<DocumentDTO>>() {},
                activeProject.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).contains(documentMapper.toDto(unlinked));
        assertThat(response.getBody()).doesNotContain(documentMapper.toDto(linked));
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /approve
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void approveDocuments_changesStateToPending_approved() {
        Document doc1 = documentRepository.save(
                buildDocument("d1", "d1-key", EntityState.PENDING_APPROVAL, activeProject));
        Document doc2 = documentRepository.save(
                buildDocument("d2", "d2-key", EntityState.PENDING_APPROVAL, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/approve",
                List.of(doc1.getId(), doc2.getId()),
                Void.class,
                activeProject.getId()
        );

        doc1 = documentRepository.findByIdAndProjectId(doc1.getId(), activeProject.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        doc2 = documentRepository.findByIdAndProjectId(doc2.getId(), activeProject.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(doc1.getState()).isEqualTo(EntityState.APPROVED);
        assertThat(doc2.getState()).isEqualTo(EntityState.APPROVED);
    }

    @Test
    void approveDocuments_returns403_whenUserLacksEditProjectPermission() {
        Document doc = documentRepository.save(
                buildDocument("d1", "d1-key", EntityState.PENDING_APPROVAL, activeProject));

        // only view, not editProject
        allowView(REQUIREMENT_ENGINEER_1_ORY_ID, activeProject.getId());

        var response = post(
                REQUIREMENT_ENGINEER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/approve",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /disable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void disableDocuments_changesStateToDisabled() {
        Document doc = documentRepository.save(
                buildDocument("active-doc", "active-key", EntityState.APPROVED, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/disable",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        doc = documentRepository.findByIdAndProjectId(doc.getId(), activeProject.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(doc.getState()).isEqualTo(EntityState.DEACTIVATED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /enable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void enableDocuments_changesStateBackToPendingApproval() {
        Document doc = documentRepository.save(
                buildDocument("disabled-doc", "disabled-key", EntityState.DEACTIVATED, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/enable",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.PENDING_APPROVAL);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /remove
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void removeDocuments_changesStateToRemoved() {
        Document doc = documentRepository.save(
                buildDocument("to-remove", "to-remove-key", EntityState.DEACTIVATED, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/remove",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        doc = documentRepository.findByIdAndProjectId(doc.getId(), activeProject.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(doc.getState()).isEqualTo(EntityState.REMOVED);
    }

    @Test
    void removeDocuments_doesNotAffectDocumentsFromOtherProjects() {
        Project otherProject = projectRepository.save(buildProject("other", ProjectState.ACTIVE));
        Document otherDoc = documentRepository.save(
                buildDocument("other-doc", "other-key", EntityState.APPROVED, otherProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/remove",
                List.of(otherDoc.getId()),   // ID belongs to a different project
                Void.class,
                activeProject.getId()        // but path scoped to activeProject
        );

        otherDoc = documentRepository.findByIdAndProjectId(otherDoc.getId(), otherProject.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        assertThat(otherDoc.getState()).isEqualTo(EntityState.APPROVED); // unchanged
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void deleteDocuments_removesDocumentsFromDatabase() {
        Document doc = documentRepository.save(
                buildDocument("to-delete", "to-delete-key", EntityState.REMOVED, activeProject));

        allowEdit(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        var response = post(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/delete",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(documentRepository.findByIdAndProjectId(doc.getId(), activeProject.getId())).isEmpty();
    }

    @Test
    void deleteDocuments_returns403_whenNonAdminAttempts() {
        Document doc = documentRepository.save(
                buildDocument("to-delete", "to-delete-key", EntityState.REMOVED, activeProject));

        // project-manager level only, not system admin
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/delete",
                List.of(doc.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(documentRepository.findByIdAndProjectId(doc.getId(), activeProject.getId())).isPresent();
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /upload  (multipart)
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void uploadDocument_createsDocumentAndReturns201() throws IOException {
        doNothing().when(minioService).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "PDF content".getBytes());

        var metadataPart = new DocumentDTO(
                null, null, "Test Upload", "application/pdf", null, null, activeProject.getId(), null,null);

        var response = postMultipart(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/upload",
                file,
                metadataPart,
                DocumentDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isNotNull();
        assertThat(documentRepository.findByIdAndProjectId(
                response.getBody().id(), activeProject.getId())).isPresent();
    }

    @Test
    void uploadDocument_returns403_whenUserLacksEditPermission() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "PDF content".getBytes());

        var metadataPart = new DocumentDTO(
                null, null,  "Unauthorized Upload", "application/pdf", null, null, activeProject.getId(), null,null);

        // no allowEdit — ketoClient returns false by default
        var response = postMultipart(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/upload",
                file,
                metadataPart,
                DocumentDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PUT /{documentId}  (multipart update)
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void updateDocument_replacesFileAndReturnsUpdatedDTO() throws IOException {
        Document existing = documentRepository.save(
                buildDocument("original", "original-key", EntityState.APPROVED, activeProject));

        doNothing().when(minioService).uploadFile(anyString(), any(InputStream.class), anyLong(), anyString());

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        MockMultipartFile newFile = new MockMultipartFile(
                "file", "updated.pdf", "application/pdf", "Updated PDF".getBytes());

        var metadataPart = new DocumentDTO(
                existing.getId(), null,"Updated Name", "application/pdf", null, null, activeProject.getId(), null,null);

        var response = putMultipart(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/" + existing.getId(),
                newFile,
                metadataPart,
                DocumentDTO.class,
                activeProject.getId(), existing.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().fileName()).isEqualTo("Updated Name");
    }

    @Test
    void updateDocument_returns403_whenUserLacksEditPermission() throws IOException {
        Document existing = documentRepository.save(
                buildDocument("original", "original-key", EntityState.APPROVED, activeProject));

        MockMultipartFile newFile = new MockMultipartFile(
                "file", "updated.pdf", "application/pdf", "Updated PDF".getBytes());

        var metadataPart = new DocumentDTO(
                existing.getId(),null, "Hacked Name", "application/pdf", null, null, activeProject.getId(), null,null);

        var response = putMultipart(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/" + existing.getId(),
                newFile,
                metadataPart,
                DocumentDTO.class,
                activeProject.getId(), existing.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Lifecycle: approve → disable → enable → remove → delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void fullDocumentLifecycle() {
        Document doc = documentRepository.save(
                buildDocument("lifecycle-doc", "lifecycle-key", EntityState.PENDING_APPROVAL, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());
        allowEdit(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        // approve
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/approve", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.APPROVED);

        // disable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/disable", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.DEACTIVATED);

        // enable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/enable", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.PENDING_APPROVAL);

        // disable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/disable", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.DEACTIVATED);

        // remove
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/remove", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(reload(doc,activeProject).getState()).isEqualTo(EntityState.REMOVED);

        // delete (admin only)
        post(SYSTEM_ADMIN_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/documents/delete", List.of(doc.getId()), Void.class, activeProject.getId());
        assertThat(documentRepository.findByIdAndProjectId(doc.getId(), activeProject.getId())).isEmpty();
    }

}