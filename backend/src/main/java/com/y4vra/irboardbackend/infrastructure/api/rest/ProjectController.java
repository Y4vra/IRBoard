package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.services.*;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final FunctionalityService functionalityService;
    private final StakeholderService stakeholderService;
    private final NonFunctionalRequirementService nonFunctionalRequirementService;
    private final DocumentService documentService;

    public ProjectController(ProjectService projectService, FunctionalityService functionalityService, StakeholderService stakeholderService, NonFunctionalRequirementService nonFunctionalRequirementService, DocumentService documentService) {
        this.projectService = projectService;
        this.functionalityService = functionalityService;
        this.stakeholderService = stakeholderService;
        this.nonFunctionalRequirementService = nonFunctionalRequirementService;
        this.documentService = documentService;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/new")
    public ResponseEntity<ProjectDTO> createProject(@Validated @RequestBody ProjectDTO projectDTO, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(projectDTO,((User) authentication.getPrincipal()).getOryId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(((User) authentication.getPrincipal()).getOryId(), id));
    }

    @GetMapping("/{id}/functionalities")
    public ResponseEntity<Map<String, List<FunctionalityDTO>>> getFunctionalities(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(functionalityService.findFunctionalitiesOfProjectForUser(((User) authentication.getPrincipal()).getOryId(),id));
    }

    @GetMapping("/{id}/stakeholders")
    public ResponseEntity<List<StakeholderDTO>> getStakeholders(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(stakeholderService.findStakeholdersOfProject(((User) authentication.getPrincipal()).getOryId(),id));
    }

    @GetMapping("/{id}/non-functional-requirements")
    public List<NonFunctionalRequirementDTO> getNonFunctionalRequirements(Authentication authentication,@PathVariable Long id) {
        return nonFunctionalRequirementService.findNonFunctionalRequirementsOfProject(((User) authentication.getPrincipal()).getOryId(),id);
    }

    @GetMapping("/{id}/documents")
    public List<DocumentDTO> getDocuments(Authentication authentication,@PathVariable Long id) {
        return documentService.findDocumentsOfProject(((User) authentication.getPrincipal()).getOryId(),id);
    }
}