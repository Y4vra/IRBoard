package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO; // Asegúrate de que el paquete sea correcto
import com.y4vra.irboardbackend.application.services.ProjectService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class DashboardController {
    private final ProjectService projectService;

    public DashboardController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/v1/dashboard")
    public Map<String, Object> getDashboardInfo(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        data.put("username", authentication.getName());
        data.put("role", role);

        List<ProjectDTO> projects = projectService.findAllProjects();
        data.put("projects", projects);

        return data;
    }
}
