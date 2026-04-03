package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.services.ProjectService;
import com.y4vra.irboardbackend.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class HomeController {
    private final ProjectService projectService;

    public HomeController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/home")
    public ResponseEntity<List<ProjectDTO>> getHome(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ProjectDTO> projects;
        if (isAdmin) {
            return ResponseEntity.status(HttpStatus.OK).body(projectService.findAllProjects());
        } else {
            return ResponseEntity.status(HttpStatus.OK).body(projectService.findProjectsForUser(user.getOryId()));
        }
    }
}
