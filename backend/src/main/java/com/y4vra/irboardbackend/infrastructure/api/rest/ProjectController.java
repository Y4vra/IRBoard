package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.services.*;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
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

    private final EntityLockService entityLockService;

    public ProjectController(ProjectService projectService, FunctionalityService functionalityService, StakeholderService stakeholderService, NonFunctionalRequirementService nonFunctionalRequirementService, DocumentService documentService, EntityLockService entityLockService) {
        this.projectService = projectService;
        this.functionalityService = functionalityService;
        this.stakeholderService = stakeholderService;
        this.nonFunctionalRequirementService = nonFunctionalRequirementService;
        this.documentService = documentService;
        this.entityLockService = entityLockService;
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

    @GetMapping("/{id}/nonFunctionalRequirements")
    public ResponseEntity<List<NonFunctionalRequirementDTO>> getNonFunctionalRequirements(Authentication authentication,@PathVariable Long id) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findNonFunctionalRequirementsOfProject(((User) authentication.getPrincipal()).getOryId(),id));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentDTO>> getDocuments(Authentication authentication,@PathVariable Long id) {
        return ResponseEntity.ok(documentService.findDocumentsOfProject(((User) authentication.getPrincipal()).getOryId(),id));
    }

    @GetMapping("/{id}/requestEdit")
    public ResponseEntity<Boolean> requestEdit(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        try {
            projectService.requestEdit(id, user);
            return ResponseEntity.ok(true);
        } catch (LockableEntityException e) {
            System.err.println(e.getMessage());
            return ResponseEntity.ok(false);
        }
    }

    @PatchMapping("/{id}/modify")
    public ResponseEntity<ProjectDTO> modify(Authentication authentication,
                                             @PathVariable Long id,
                                             @RequestBody ProjectDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(projectService.patch(id, patch, user));
    }
}