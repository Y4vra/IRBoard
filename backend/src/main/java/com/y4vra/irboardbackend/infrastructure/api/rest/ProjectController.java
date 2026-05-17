package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.ports.PermissionService;
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

    private final FunctionalRequirementService functionalRequirementService;
    private final PermissionService permissionService;

    public ProjectController(ProjectService projectService, FunctionalityService functionalityService, StakeholderService stakeholderService, NonFunctionalRequirementService nonFunctionalRequirementService, DocumentService documentService, FunctionalRequirementService functionalRequirementService, PermissionService permissionService) {
        this.projectService = projectService;
        this.functionalityService = functionalityService;
        this.stakeholderService = stakeholderService;
        this.nonFunctionalRequirementService = nonFunctionalRequirementService;
        this.documentService = documentService;
        this.functionalRequirementService = functionalRequirementService;
        this.permissionService = permissionService;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/new")
    public ResponseEntity<ProjectDTO> createProject(@Validated @RequestBody ProjectDTO projectDTO, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(projectDTO,((User) authentication.getPrincipal()).getOryId()));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> getProjectById(Authentication authentication, @PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.findById(((User) authentication.getPrincipal()).getOryId(), projectId));
    }
    @GetMapping("/{projectId}/isManager")
    public ResponseEntity<Boolean> getCurrentUser(Authentication authentication, @PathVariable Long projectId) {
        return ResponseEntity.ok(permissionService.checkPermission("Project",String.valueOf(projectId),"editProject",((User)authentication.getPrincipal()).getOryId()));
    }

    @GetMapping("/{projectId}/functionalities")
    public ResponseEntity<Map<String, List<FunctionalityDTO>>> getFunctionalities(Authentication authentication, @PathVariable Long projectId) {
        return ResponseEntity.ok(functionalityService.findFunctionalitiesOfProjectForUser(((User) authentication.getPrincipal()).getOryId(),projectId));
    }
    @GetMapping("/{projectId}/functionalRequirements/observable/{requirementId}")
    public ResponseEntity<List<FunctionalityDTO>> getObservableStakeholdersForRequirement(Authentication authentication, @PathVariable Long projectId, @PathVariable Long requirementId) {
        return ResponseEntity.ok(functionalRequirementService.findObservableFRequirementsGroupedByFunctionality(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }

    @GetMapping("/{projectId}/stakeholders")
    public ResponseEntity<List<StakeholderDTO>> getStakeholders(Authentication authentication, @PathVariable Long projectId) {
        return ResponseEntity.ok(stakeholderService.findStakeholdersOfProject(((User) authentication.getPrincipal()).getOryId(),projectId));
    }

    @GetMapping("/{projectId}/nonFunctionalRequirements")
    public ResponseEntity<List<NonFunctionalRequirementDTO>> getNonFunctionalRequirements(Authentication authentication,@PathVariable Long projectId) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findNonFunctionalRequirementsOfProject(((User) authentication.getPrincipal()).getOryId(),projectId));
    }

    @GetMapping("/{projectId}/documents")
    public ResponseEntity<List<DocumentDTO>> getDocuments(Authentication authentication,@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.findDocumentsOfProject(((User) authentication.getPrincipal()).getOryId(),projectId));
    }

    @GetMapping("/{projectId}/requestEdit")
    public ResponseEntity<Void> requestEdit(Authentication authentication, @PathVariable Long projectId) {
        User user = (User) authentication.getPrincipal();
        projectService.requestEdit(projectId, user);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{projectId}/modify")
    public ResponseEntity<ProjectDTO> modify(Authentication authentication,
                                             @PathVariable Long projectId,
                                             @RequestBody ProjectDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(projectService.patch(projectId, patch, user));
    }
    @PostMapping("/{projectId}/approveAll")
    public ResponseEntity<Void> approveAllElements(Authentication authentication, @PathVariable Long projectId) {
        projectService.approveAllElements(((User) authentication.getPrincipal()).getOryId(),projectId);
        return ResponseEntity.ok().build();
    }
}