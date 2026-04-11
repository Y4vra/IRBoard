package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.infrastructure.api.rest.errors.ReBACException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FunctionalityService {

    private final FunctionalityRepository functionalityRepository;
    private final ProjectRepository projectRepository;
    private final FunctionalityMapper functionalityMapper;
    private final PermissionService permService;

    public FunctionalityService(FunctionalityRepository functionalityRepository, ProjectRepository projectRepository, FunctionalityMapper functionalityMapper,PermissionService permService) {
        this.functionalityRepository = functionalityRepository;
        this.projectRepository = projectRepository;
        this.functionalityMapper = functionalityMapper;
        this.permService = permService;
    }

    @Transactional(readOnly = true)
    public Map<String, List<FunctionalityDTO>> findFunctionalitiesOfProjectForUser(String oryId, long projectId) {
        List<Functionality> allProjectFunctionalities = functionalityRepository.findAll().stream()
                .filter(f -> f.getProject().getId() == projectId)
                .toList();

        List<String> canEditIds = permService.getAuthorizedObjects(
                oryId,
                "Functionality",
                "editRequirements"
        );

        List<String> canViewIds = permService.getAuthorizedObjects(
                oryId,
                "Functionality",
                "viewRequirements"
        );

        Set<Long> editSet = canEditIds.stream().map(Long::valueOf).collect(Collectors.toSet());
        Set<Long> viewSet = canViewIds.stream().map(Long::valueOf).collect(Collectors.toSet());

        Map<String, List<FunctionalityDTO>> result = new HashMap<>();
        result.put("edit", new ArrayList<>());
        result.put("view", new ArrayList<>());
        result.put("none", new ArrayList<>());

        for (Functionality f : allProjectFunctionalities) {
            FunctionalityDTO dto = functionalityMapper.toDto(f);
            Long id = f.getId();

            if (editSet.contains(id)) {
                result.get("edit").add(dto);
            } else if (viewSet.contains(id)) {
                result.get("view").add(dto);
            } else {
                result.get("none").add(dto);
            }
        }

        return result;
    }
    @Transactional
    public FunctionalityDTO createFunctionality(FunctionalityDTO dto, long projectId, String oryId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        boolean isAllowed = permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId);

        if (!isAllowed) {
            throw new AccessDeniedException("User not authorized to add functionalities to this project");
        }

        Functionality functionality = new Functionality();
        functionality.setName(dto.name());
        functionality.setProject(project);

        if (dto.label() != null && !dto.label().isBlank()) {
            functionality.setLabel(dto.label());
        } else {
            functionality.setLabel(generateLabel(dto.name()));
        }

        Functionality saved = functionalityRepository.save(functionality);

        permService.grantPermission("Functionality", String.valueOf(saved.getId()), "project", "Project:" + projectId);

        return functionalityMapper.toDto(saved);
    }

    private String generateLabel(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Cannot generate label for empty name");
        }

        String[] words = name.trim().split("\\s+");
        StringBuilder label = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                label.append(Character.toUpperCase(word.charAt(0)));
            }
        }

        if (words.length == 1 && name.length() >= 3) {
            return name.substring(0, 3).toUpperCase();
        }

        return label.toString();
    }
}