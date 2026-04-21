package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.services.*;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/projects/{projectId}/functionalities")
public class FunctionalityController {

    private final FunctionalityService functionalityService;

    public FunctionalityController(FunctionalityService functionalityService) {
        this.functionalityService = functionalityService;
    }

    @PostMapping("/new")
    public ResponseEntity<FunctionalityDTO> createFunctionality(@Validated @RequestBody FunctionalityDTO functionalityDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(functionalityService.createFunctionality(functionalityDTO,projectId,((User) authentication.getPrincipal()).getOryId()));
    }

    @GetMapping("/{functionalityId}")
    public ResponseEntity<FunctionalityDTO> getFunctionalityById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(functionalityService.findFunctionalityById(((User) authentication.getPrincipal()).getOryId(),projectId, functionalityId));
    }
}