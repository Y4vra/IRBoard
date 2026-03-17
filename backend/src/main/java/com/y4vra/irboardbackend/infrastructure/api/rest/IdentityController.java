package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class IdentityController {
    @GetMapping("/auth/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        Map<String, Object> response = new HashMap<>();
        response.put("name", user.getName());
        response.put("surname", user.getSurname());
        response.put("email", user.getEmail());
        response.put("isAdmin", isAdmin);

        return response;
    }
}
