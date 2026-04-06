package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.services.UserService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IdentityController {

    private final UserService userService;

    public IdentityController(UserService userService) {
        this.userService = userService;
    }

    public record ActivationRequest(String email, String code, String password) {}

    @PostMapping("/auth/activate")
    public ResponseEntity<UserDTO> activateUser(@RequestBody ActivationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.activateInvitedUser(
                        request.email(),
                        request.code(),
                        request.password()
                ));
    }

    @GetMapping("/whoami")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) authentication.getPrincipal();
        UserDTO userDTO = userService.getUserAuthenticatedDto(user);

        return ResponseEntity.ok(userDTO);
    }
}
