package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.EntityLockDTO;
import com.y4vra.irboardbackend.application.services.EntityLockService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class LocksController {
    private final EntityLockService lockService;

    public LocksController(EntityLockService lockService) {
        this.lockService = lockService;
    }

    @GetMapping("/systemLocks")
    public ResponseEntity<List<EntityLockDTO>> getSystemLocks() {
        return ResponseEntity.status(HttpStatus.OK).body(lockService.findSystemLocks());
    }

    @GetMapping("/projectLocks/{projectId}")
    public ResponseEntity<List<EntityLockDTO>> getProjectLocks(Authentication authentication, @PathVariable Long projectId) {
        return ResponseEntity.status(HttpStatus.OK).body(lockService.findLocksForProject(((User) authentication.getPrincipal()).getOryId(), projectId));
    }
}
