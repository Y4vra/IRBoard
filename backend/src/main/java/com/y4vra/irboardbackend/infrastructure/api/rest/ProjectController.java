package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.services.ProjectService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/new")
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO projectDTO, Authentication authentication) {
        ProjectDTO createdProject = projectService.createProject(projectDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(((User) authentication.getPrincipal()).getOryId(), id));
    }

//    @GetMapping("/{id}/functionalities")
//    public List<FunctionalityDTO> getFunctionalities(@PathVariable Long id) {
//        return projectService.findFunctionalitiesByProjectId(id);
//    }
//
//    @GetMapping("/{id}/stakeholders")
//    public List<StakeholderDTO> getStakeholders(@PathVariable Long id) {
//        return projectService.findStakeholdersByProjectId(id);
//    }
//
//    @GetMapping("/{id}/non-functional-requirements")
//    public List<NonFunctionalRequirementDTO> getNonFunctionalRequirements(@PathVariable Long id) {
//        return projectService.findNonFunctionalByProjectId(id);
//    }
//
//    @GetMapping("/{id}/documents")
//    public List<DocumentDTO> getDocuments(@PathVariable Long id) {
//        return projectService.findDocumentsByProjectId(id);
//    }
}