package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.services.FunctionalRequirementService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects/{projectId}/functionalities/{functionalityId}/functionalRequirements/")
public class FunctionalRequirementController {

    private final FunctionalRequirementService functionalRequirementService;

    public FunctionalRequirementController(FunctionalRequirementService functionalRequirementService) {
        this.functionalRequirementService = functionalRequirementService;
    }

    @PostMapping("/new")
    public ResponseEntity<FunctionalRequirementDTO> createFunctionalRequirement(@Validated @RequestBody FunctionalRequirementDTO functionalRequirementDTO, @PathVariable Long functionalityId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(functionalRequirementService.createFunctionalRequirement(((User) authentication.getPrincipal()).getOryId(),functionalRequirementDTO,functionalityId));
    }

    @GetMapping("/{functionalRequirementId}")
    public ResponseEntity<FunctionalRequirementDTO> getFunctionalRequirementById(Authentication authentication,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementById(((User) authentication.getPrincipal()).getOryId(),functionalityId, functionalRequirementId));
    }
}