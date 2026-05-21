package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.services.FunctionalRequirementService;
import com.y4vra.irboardbackend.domain.model.User;
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

    @GetMapping("/")
    public ResponseEntity<List<FunctionalRequirementDTO>> getFunctionalRequirementsNotRemovedOfFunctionality(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementsNotRemovedOfFunctionality(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId));
    }
    @GetMapping("/removed")
    public ResponseEntity<List<FunctionalRequirementDTO>> getFunctionalRequirementsRemovedOfFunctionality(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementsRemovedOfFunctionality(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId));
    }
    @GetMapping("/{functionalRequirementId}")
    public ResponseEntity<FunctionalRequirementDTO> getFunctionalRequirementById(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId) {
        return ResponseEntity.ok(functionalRequirementService.findFunctionalRequirementById(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId, functionalRequirementId));
    }
    @GetMapping("/{functionalRequirementId}/requestEdit")
    public ResponseEntity<Void> requestEdit(Authentication authentication, @PathVariable Long projectId,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId) {
        User user = (User) authentication.getPrincipal();
        functionalRequirementService.requestEdit(user,projectId,functionalityId,functionalRequirementId);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{functionalRequirementId}/modify")
    public ResponseEntity<FunctionalRequirementDTO> modify(Authentication authentication,
                                                 @PathVariable Long projectId,
                                                 @PathVariable Long functionalityId,
                                                 @PathVariable Long functionalRequirementId,
                                                 @RequestBody FunctionalRequirementDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(functionalRequirementService.patch(user,projectId,functionalityId,functionalRequirementId,patch));
    }
    @PatchMapping("/{functionalRequirementId}/changeParent")
    public ResponseEntity<Void> changeParentFunctionalRequirement(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId, @RequestBody(required = false) Long newParentId) {
        functionalRequirementService.changeParent(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,newParentId);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{functionalRequirementId}/reorder")
    public ResponseEntity<Void> reorderFunctionalRequirement(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @PathVariable Long functionalRequirementId, @RequestBody Long orderValue) {
        functionalRequirementService.reorderRequirement(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,orderValue);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approve")
    public ResponseEntity<Void> approveFunctionalRequirementsOfFunctionality(Authentication authentication, @PathVariable Long projectId,@PathVariable Long functionalityId, @RequestBody List<Long> functionalRequirementIds) {
        functionalRequirementService.approveRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementIds);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/disable")
    public ResponseEntity<Void> disableFunctionalRequirements(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @RequestBody List<Long> nonFunctionalRequirementIds) {
        functionalRequirementService.disableFunctionalRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,nonFunctionalRequirementIds);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/enable")
    public ResponseEntity<Void> enableFunctionalRequirements(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @RequestBody List<Long> functionalRequirementIds) {
        functionalRequirementService.enableFunctionalRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementIds);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/remove")
    public ResponseEntity<Void> removeFunctionalRequirements(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @RequestBody List<Long> functionalRequirementIds) {
        functionalRequirementService.removeFunctionalRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementIds);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteFunctionalRequirements(Authentication authentication,@PathVariable Long projectId,@PathVariable Long functionalityId, @RequestBody List<Long> functionalRequirementIds) {
        functionalRequirementService.deleteFunctionalRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementIds);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/new")
    public ResponseEntity<FunctionalRequirementDTO> createFunctionalRequirement(@Validated @RequestBody FunctionalRequirementDTO functionalRequirementDTO, @PathVariable Long projectId, @PathVariable Long functionalityId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(functionalRequirementService.createFunctionalRequirement(((User) authentication.getPrincipal()).getOryId(),functionalRequirementDTO,projectId,functionalityId));
    }

    @PostMapping("/{functionalRequirementId}/linkStakeholder")
    public ResponseEntity<Void> linkStakeholder(@RequestBody Long stakeholderId,@PathVariable Long projectId,@PathVariable Long functionalRequirementId,@PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.observeStakeholder(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,stakeholderId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalRequirementId}/linkDocument")
    public ResponseEntity<Void> linkDocument(@RequestBody Long documentId,@PathVariable Long projectId,@PathVariable Long functionalRequirementId, @PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.observeDocument(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,documentId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalRequirementId}/linkRequirement")
    public ResponseEntity<Void> linkRequirement(@RequestBody Long nfrId,@PathVariable Long functionalRequirementId, @PathVariable Long functionalityId,@PathVariable Long projectId, Authentication authentication) {
        functionalRequirementService.observeRequirement(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,nfrId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalRequirementId}/unlinkStakeholder")
    public ResponseEntity<Void> unlinkStakeholder(@RequestBody Long stakeholderId,@PathVariable Long projectId,@PathVariable Long functionalRequirementId, @PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.unobserveStakeholder(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,stakeholderId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalRequirementId}/unlinkDocument")
    public ResponseEntity<Void> unlinkDocument(@RequestBody Long documentId,@PathVariable Long projectId,@PathVariable Long functionalRequirementId, @PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.unobserveDocument(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,documentId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{functionalRequirementId}/unlinkRequirement")
    public ResponseEntity<Void> unlinkRequirement(@RequestBody Long nfrId,@PathVariable Long functionalRequirementId,@PathVariable Long projectId, @PathVariable Long functionalityId, Authentication authentication) {
        functionalRequirementService.unobserveRequirement(((User) authentication.getPrincipal()).getOryId(),projectId,functionalityId,functionalRequirementId,nfrId);
        return ResponseEntity.ok().build();
    }
}