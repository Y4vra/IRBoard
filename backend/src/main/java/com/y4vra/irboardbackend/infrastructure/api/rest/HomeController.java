package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO; // Asegúrate de que el paquete sea correcto
import com.y4vra.irboardbackend.application.services.ProjectService;
import com.y4vra.irboardbackend.domain.model.User;
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
    public Map<String, Object> getHome(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();

        User user = (User) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        data.put("message", "Hola " + user.getName() + " " + user.getSurname());
        data.put("email", user.getEmail());
        data.put("oryId", user.getOryId());
        data.put("role", isAdmin ? "ADMIN" : "USER");

        List<ProjectDTO> projects;
        if (isAdmin) {
            projects = projectService.findAllProjects();
        } else {
            projects = projectService.findProjectsForUser(user.getOryId());
        }
        data.put("projects", projects);

        return data;
    }
}
