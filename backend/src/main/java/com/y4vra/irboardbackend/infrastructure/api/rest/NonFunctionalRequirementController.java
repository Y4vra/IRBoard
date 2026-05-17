package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
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

    @GetMapping("/{nonFunctionalRequirementId}")
    public ResponseEntity<NonFunctionalRequirementDTO> getNonFunctionalRequirementById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long nonFunctionalRequirementId) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findNonFunctionalRequirementById(((User) authentication.getPrincipal()).getOryId(),projectId, nonFunctionalRequirementId));
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<NonFunctionalRequirementDTO>> getObservableStakeholdersForRequirement(Authentication authentication, @PathVariable Long projectId, @PathVariable Long requirementId) {
        return ResponseEntity.ok(nonFunctionalRequirementService.findObservableNfRequirementsForRequirement(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }
    @GetMapping("/{nonFunctionalRequirementId}/requestEdit")
    public ResponseEntity<Void> requestEdit(Authentication authentication, @PathVariable Long projectId, @PathVariable Long nonFunctionalRequirementId) {
        User user = (User) authentication.getPrincipal();
        nonFunctionalRequirementService.requestEdit(user,projectId,nonFunctionalRequirementId);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{nonFunctionalRequirementId}/modify")
    public ResponseEntity<NonFunctionalRequirementDTO> modify(Authentication authentication,
                                                           @PathVariable Long projectId,
                                                           @PathVariable Long nonFunctionalRequirementId,
                                                           @RequestBody NonFunctionalRequirementDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(nonFunctionalRequirementService.patch(user,projectId,nonFunctionalRequirementId,patch));
    }
    @PatchMapping("/{nonFunctionalRequirementId}/reorder")
    public ResponseEntity<Void> reorderNonFunctionalRequirement(Authentication authentication, @PathVariable Long projectId, @PathVariable Long nonFunctionalRequirementId, @RequestBody Long orderValue) {
        nonFunctionalRequirementService.reorderRequirement(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,orderValue);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/{nonFunctionalRequirementId}/changeParent")
    public ResponseEntity<Void> changeParentNonFunctionalRequirement(Authentication authentication, @PathVariable Long projectId, @PathVariable Long nonFunctionalRequirementId, @RequestBody(required = false) Long newParentId) {
        nonFunctionalRequirementService.changeParent(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,newParentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approve")
    public ResponseEntity<Void> approveFunctionalRequirementsOfFunctionality(Authentication authentication, @PathVariable Long projectId, @RequestBody List<Long> functionalRequirementIds) {
        nonFunctionalRequirementService.approveRequirements(((User)authentication.getPrincipal()).getOryId(),projectId,functionalRequirementIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/new")
    public ResponseEntity<NonFunctionalRequirementDTO> createNonFunctionalRequirement(@Validated @RequestBody NonFunctionalRequirementDTO nonFunctionalRequirementDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nonFunctionalRequirementService.createNonFunctionalRequirement(((User) authentication.getPrincipal()).getOryId(),nonFunctionalRequirementDTO,projectId));
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
    @PostMapping("/{nonFunctionalRequirementId}/unlinkStakeholder")
    public ResponseEntity<Void> unlinkStakeholder(@RequestBody Long stakeholderId,@PathVariable Long nonFunctionalRequirementId, @PathVariable Long projectId, Authentication authentication) {
        nonFunctionalRequirementService.unobserveStakeholder(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,stakeholderId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{nonFunctionalRequirementId}/unlinkDocument")
    public ResponseEntity<Void> unlinkDocument(@RequestBody Long documentId,@PathVariable Long nonFunctionalRequirementId, @PathVariable Long projectId, Authentication authentication) {
        nonFunctionalRequirementService.unobserveDocument(((User) authentication.getPrincipal()).getOryId(),projectId,nonFunctionalRequirementId,documentId);
        return ResponseEntity.ok().build();
    }
}