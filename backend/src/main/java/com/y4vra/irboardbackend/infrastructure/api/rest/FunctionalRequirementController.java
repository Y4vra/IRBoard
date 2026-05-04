package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.services.FunctionalRequirementService;
import com.y4vra.irboardbackend.domain.model.User;
import io.minio.Http;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/functionalities/{functionalityId}/functionalRequirements")
public class FunctionalRequirementController {

    private final FunctionalRequirementService functionalRequirementService;

    public FunctionalRequirementController(FunctionalRequirementService functionalRequirementService) {
        this.functionalRequirementService = functionalRequirementService;
    }

    @GetMapping("/{functionalRequirementId}")
    public ResponseEntity<FunctionalRequirementDTO> getFunctionalRequirementById(Authentication authentication,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementById(((User) authentication.getPrincipal()).getOryId(),functionalityId, functionalRequirementId));
    }
    @GetMapping("/")
    public ResponseEntity<List<FunctionalRequirementDTO>> getFunctionalRequirementOfFunctionality(Authentication authentication, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementsOfFunctionality(((User) authentication.getPrincipal()).getOryId(),functionalityId));
    }

    @PostMapping("/new")
    public ResponseEntity<FunctionalRequirementDTO> createFunctionalRequirement(@Validated @RequestBody FunctionalRequirementDTO functionalRequirementDTO, @PathVariable Long functionalityId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(functionalRequirementService.createFunctionalRequirement(((User) authentication.getPrincipal()).getOryId(),functionalRequirementDTO,functionalityId));
    }

    @PostMapping("/{functionalRequirementId}/linkStakeholder")
    public ResponseEntity<Void> linkStakeholder(@RequestBody Long stakeholderId,@PathVariable Long functionalRequirementId, @PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.observeStakeholder(((User) authentication.getPrincipal()).getOryId(),functionalityId,functionalRequirementId,stakeholderId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<FunctionalRequirementDTO>> getObservableStakeholdersForRequirement(Authentication authentication, @PathVariable Long functionalityId, @PathVariable Long requirementId) {
        return ResponseEntity.ok(functionalRequirementService.findObservableFRequirementsForRequirement(((User) authentication.getPrincipal()).getOryId(),functionalityId, requirementId));
    }
}