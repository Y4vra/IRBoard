package com.y4vra.irboardbackend.infrastructure.api.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DashboardController {
    @GetMapping("/v1/dashboard")
    public Map<String, Object> getDashboardInfo(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();

        // Obtenemos el rol principal
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority())
                .orElse("ROLE_USER");

        data.put("username", authentication.getName());
        data.put("role", role);

        // Aquí podrías añadir métricas o datos rápidos para el dashboard
        // data.put("totalPendingRequirements", service.countPending());

        return data; // Jackson lo convierte a JSON automáticamente
}
