package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NonFunctionalRequirementService {

    private final NonFunctionalRequirementRepository nfrRepository;
    private final NonFunctionalRequirementMapper nfrMapper;
    private final PermissionService permService;

    public NonFunctionalRequirementService(NonFunctionalRequirementRepository nfrRepository,
                                           NonFunctionalRequirementMapper nfrMapper,
                                           PermissionService permService) {
        this.nfrRepository = nfrRepository;
        this.nfrMapper = nfrMapper;
        this.permService = permService;
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findNonFunctionalRequirementsOfProject(String oryId,Long projectId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view non functional requirements of this project");
        }
        return nfrRepository.findAllByProjectId(projectId).stream()
                .map(nfrMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NonFunctionalRequirementDTO createNonFunctionalRequirement(NonFunctionalRequirementDTO dto, String oryId) {
        NonFunctionalRequirement nfr = nfrMapper.toEntity(dto);
        NonFunctionalRequirement saved = nfrRepository.save(nfr);

        permService.grantPermission("Requirement", String.valueOf(saved.getId()), "parents", "Project:" + dto.projectId());
        permService.grantPermission("Requirement", String.valueOf(saved.getId()), "managers", oryId);

        return nfrMapper.toDto(saved);
    }
}