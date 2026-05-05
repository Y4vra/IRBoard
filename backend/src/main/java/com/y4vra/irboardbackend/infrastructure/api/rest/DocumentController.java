package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.services.DocumentService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentDTO> getDocumentById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.findDocumentById(((User) authentication.getPrincipal()).getOryId(),projectId, documentId));
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<DocumentDTO>> getObservableDocumentsForRequirement(Authentication authentication,@PathVariable Long projectId,@PathVariable Long requirementId) {
        return ResponseEntity.ok(documentService.findObservableDocumentsForRequirement(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDTO> createDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") @Validated DocumentDTO documentDTO,
            @PathVariable Long projectId,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(
                        file,
                        documentDTO,
                        projectId,
                        ((User) authentication.getPrincipal()).getOryId()
                ));
    }
}