package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.services.*;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/functionalities")
public class FunctionalityController {

    private final FunctionalityService functionalityService;
    private final FunctionalRequirementService functionalRequirementService;

    public FunctionalityController(FunctionalityService functionalityService, FunctionalRequirementService functionalRequirementService) {
        this.functionalityService = functionalityService;
        this.functionalRequirementService = functionalRequirementService;
    }

    @GetMapping("/{functionalityId}")
    public ResponseEntity<FunctionalityDTO> getFunctionalityById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(functionalityService.findFunctionalityById(((User) authentication.getPrincipal()).getOryId(),projectId, functionalityId));
    }
    @GetMapping("/{functionalityId}/requestEdit")
    public ResponseEntity<Void> requestEdit(Authentication authentication, @PathVariable Long projectId, @PathVariable Long functionalityId) {
        User user = (User) authentication.getPrincipal();
        functionalityService.requestEdit(user,projectId,functionalityId);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{functionalityId}/modify")
    public ResponseEntity<FunctionalityDTO> modify(Authentication authentication,
                                                 @PathVariable Long projectId,
                                                 @PathVariable Long functionalityId,
                                                 @RequestBody FunctionalityDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(functionalityService.patch(user,projectId,functionalityId,patch));
    }
    @PostMapping("/{functionalityId}/disable")
    @Transactional
    public ResponseEntity<Void> disableFunctionality(Authentication authentication, @PathVariable Long projectId,@PathVariable Long functionalityId) {
        String oryId= ((User)authentication.getPrincipal()).getOryId();
        List<Long> rootRequirementIds = functionalityService.getRootRequirementIds(projectId,functionalityId);
        functionalRequirementService.disableFunctionalRequirements(oryId,projectId,functionalityId,rootRequirementIds);
        functionalityService.disableFunctionality(oryId,projectId,functionalityId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalityId}/enable")
    public ResponseEntity<Void> enableFunctionality(Authentication authentication, @PathVariable Long projectId, @PathVariable Long functionalityId) {
        functionalityService.enableFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalityId}/remove")
    @Transactional
    public ResponseEntity<Void> removeFunctionality(Authentication authentication, @PathVariable Long projectId, @PathVariable Long functionalityId) {
        String oryId = ((User)authentication.getPrincipal()).getOryId();
        List<Long> rootRequirementIds = functionalityService.getRootRequirementIds(projectId,functionalityId);
        functionalRequirementService.removeFunctionalRequirements(oryId,projectId,functionalityId,rootRequirementIds);
        functionalityService.removeFunctionality(oryId,projectId,functionalityId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalityId}/delete")
    public ResponseEntity<Void> deleteFunctionality(Authentication authentication, @PathVariable Long projectId, @PathVariable Long functionalityId) {
        functionalityService.deleteFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/new")
    public ResponseEntity<FunctionalityDTO> createFunctionality(@Validated @RequestBody FunctionalityDTO functionalityDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(functionalityService.createFunctionality(functionalityDTO,projectId,((User) authentication.getPrincipal()).getOryId()));
    }
}