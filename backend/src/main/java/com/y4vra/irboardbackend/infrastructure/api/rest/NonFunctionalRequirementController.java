package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.services.NonFunctionalRequirementService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
}