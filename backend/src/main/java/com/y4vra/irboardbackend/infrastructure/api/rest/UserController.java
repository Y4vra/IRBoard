package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.services.UserService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.User;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/invite")
    public ResponseEntity<UserDTO> inviteUser(@Validated @RequestBody UserDTO userDTO, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.inviteUser(userDTO, ((User) authentication.getPrincipal()).getOryId()));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Validated @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/{id}/re-invite")
    public ResponseEntity<UserDTO> reinviteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.generateNewInvite(id));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}/requestEdit")
    public ResponseEntity<Void> requestEdit(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        userService.requestEdit(id, user);
        return ResponseEntity.ok().build();
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PatchMapping("/{id}/modify")
    public ResponseEntity<UserDTO> modify(Authentication authentication,
                                             @PathVariable Long id,
                                             @RequestBody UserDTO patch) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.patch(id, patch, user));
    }

    //---------------Linking-------------------
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/linking/{projectId}")
    public ResponseEntity<Map<String,List<UserDTO>>> getAllUsersForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(userService.findAllForProject(projectId));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/linking/{projectId}")
    public ResponseEntity<Void> linkUserToProject(@PathVariable Long projectId, @RequestBody Long userIdToBeLinked) {
        userService.linkUserToProject(projectId,userIdToBeLinked);
        return ResponseEntity.ok().build();
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/linking/{projectId}/{userId}")
    public ResponseEntity<Void> unlinkUserFromProject(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        userService.unlinkUserFromProject(projectId, userId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
    @GetMapping("/linking/{projectId}/{functionalityId}")
    public ResponseEntity<Map<String, List<UserDTO>>> getAllUsersForFunctionality(Authentication authentication, @PathVariable Long projectId, @PathVariable Long functionalityId) {
        return ResponseEntity.ok(userService.findAllForProjectsFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId));
    }
    @PostMapping("/linking/{projectId}/{functionalityId}/engineer")
    public ResponseEntity<Void> linkUserToProjectsFunctionalityAsEngineer(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId, @RequestBody Long userIdToBeLinked) {
        userService.linkUserToProjectsFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,userIdToBeLinked,"engineers");
        return ResponseEntity.ok().build();
    }
    @PostMapping("/linking/{projectId}/{functionalityId}/stakeholder")
    public ResponseEntity<Void> linkUserToProjectsFunctionalityAsStakeholder(Authentication authentication,@PathVariable Long projectId, @PathVariable Long functionalityId, @RequestBody Long userIdToBeLinked) {
        userService.linkUserToProjectsFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId,functionalityId,userIdToBeLinked,"stakeholders");
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/linking/{projectId}/{functionalityId}/engineer/{userId}")
    public ResponseEntity<Void> unlinkEngineerFromFunctionality(
            Authentication authentication,
            @PathVariable Long projectId,
            @PathVariable Long functionalityId,
            @PathVariable Long userId
    ) {
        userService.unlinkUserFromProjectsFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId, functionalityId, userId, "engineers");
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/linking/{projectId}/{functionalityId}/stakeholder/{userId}")
    public ResponseEntity<Void> unlinkStakeholderFromFunctionality(
            Authentication authentication,
            @PathVariable Long projectId,
            @PathVariable Long functionalityId,
            @PathVariable Long userId
    ) {
        userService.unlinkUserFromProjectsFunctionality(((User)authentication.getPrincipal()).getOryId(),projectId, functionalityId, userId, "stakeholders");
        return ResponseEntity.noContent().build();
    }
}