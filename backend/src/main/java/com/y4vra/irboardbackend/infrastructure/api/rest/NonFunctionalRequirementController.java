package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.services.NonFunctionalRequirementService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/nonFunctionalRequirements")
public class NonFunctionalRequirementController {

    private final NonFunctionalRequirementService nonFunctionalRequirementService;

    public NonFunctionalRequirementController(NonFunctionalRequirementService nonFunctionalRequirementService) {
        this.nonFunctionalRequirementService = nonFunctionalRequirementService;
    }

    @PostMapping("/new")
    public ResponseEntity<NonFunctionalRequirementDTO> createNonFunctionalRequirement(@Validated @RequestBody NonFunctionalRequirementDTO nonFunctionalRequirementDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nonFunctionalRequirementService.createNonFunctionalRequirement(((User) authentication.getPrincipal()).getOryId(),nonFunctionalRequirementDTO,projectId));
    }

    @GetMapping("/{nonFunctionalRequirementId}")
    public ResponseEntity<NonFunctionalRequirementDTO> getNonFunctionalRequirementById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long nonFunctionalRequirementId) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findNonFunctionalRequirementById(((User) authentication.getPrincipal()).getOryId(),projectId, nonFunctionalRequirementId));
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<NonFunctionalRequirementDTO>> getObservableStakeholdersForRequirement(Authentication authentication, @PathVariable Long projectId, @PathVariable Long requirementId) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findObservableNfRequirementsForRequirement(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }
    @PostMapping("/{nonFunctionalRequirementId}/linkStakeholder")
    public ResponseEntity<Void> linkStakeholder(@RequestBody Long stakeholderId,@PathVariable Long nonFunctionalRequirementId, @PathVariable Long projectId, Authentication authentication) {
        nonFunctionalRequirementService.observeStakeholder(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,stakeholderId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{nonFunctionalRequirementId}/linkDocument")
    public ResponseEntity<Void> linkDocument(@RequestBody Long documentId,@PathVariable Long nonFunctionalRequirementId, @PathVariable Long projectId, Authentication authentication) {
        nonFunctionalRequirementService.observeDocument(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,documentId);
        return ResponseEntity.ok().build();
    }
}