package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.application.services.DocumentService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/new")
    public ResponseEntity<DocumentDTO> createDocument(@Validated @RequestBody DocumentDTO documentDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.uploadDocument(documentDTO,projectId,((User) authentication.getPrincipal()).getOryId()));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentDTO> getDocumentById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.findDocumentById(((User) authentication.getPrincipal()).getOryId(),projectId, documentId));
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<DocumentDTO>> getObservableDocumentsForRequirement(Authentication authentication,@PathVariable Long projectId,@PathVariable Long requirementId) {
        return ResponseEntity.ok(documentService.findObservableDocumentsForRequirement(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }
}