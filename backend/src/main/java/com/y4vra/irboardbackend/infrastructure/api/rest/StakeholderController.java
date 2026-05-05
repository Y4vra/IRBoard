package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.services.StakeholderService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/stakeholders")
public class StakeholderController {

    private final StakeholderService stakeholderService;

    public StakeholderController(StakeholderService stakeholderService) {
        this.stakeholderService = stakeholderService;
    }

    @PostMapping("/new")
    public ResponseEntity<StakeholderDTO> createStakeholder(@Validated @RequestBody StakeholderDTO stakeholderDTO, @PathVariable Long projectId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stakeholderService.createStakeholder(((User) authentication.getPrincipal()).getOryId(),stakeholderDTO,projectId));
    }

    @GetMapping("/{stakeholderId}")
    public ResponseEntity<StakeholderDTO> getStakeholderById(Authentication authentication,@PathVariable Long projectId, @PathVariable Long stakeholderId) {
        return ResponseEntity.ok(stakeholderService.findStakeholderById(((User) authentication.getPrincipal()).getOryId(),projectId, stakeholderId));
    }
    @GetMapping("/observable/{requirementId}")
    public ResponseEntity<List<StakeholderDTO>> getObservableStakeholdersForRequirement(Authentication authentication,@PathVariable Long projectId,@PathVariable Long requirementId) {
        return ResponseEntity.ok(stakeholderService.findObservableStakeholdersForRequirement(((User) authentication.getPrincipal()).getOryId(),projectId, requirementId));
    }
}