package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NonFunctionalRequirementService {

    private final NonFunctionalRequirementRepository nfrRepository;
    private final ProjectRepository projectRepository;
    private final NonFunctionalRequirementMapper nfrMapper;
    private final PermissionService permService;

    public NonFunctionalRequirementService(NonFunctionalRequirementRepository nfrRepository,
                                           NonFunctionalRequirementMapper nfrMapper,
                                           PermissionService permService,ProjectRepository projectRepository) {
        this.nfrRepository = nfrRepository;
        this.projectRepository = projectRepository;
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
    @Transactional(readOnly = true)
    public NonFunctionalRequirementDTO findNonFunctionalRequirementById(String oryId, long projectId, long nonFunctionalRequirementId) {
        Optional<NonFunctionalRequirement> nonFunctionalRequirement = nfrRepository.findById(nonFunctionalRequirementId);

        if(nonFunctionalRequirement.isEmpty()) {
            throw new EntityNotFoundException("NonFunctionalRequirement with id " + nonFunctionalRequirementId + " not found");
        }
        if(nonFunctionalRequirement.get().getProject().getId() != projectId){
            throw new EntityNotFoundException("NonFunctionalRequirement with id " + nonFunctionalRequirementId + " not found");
        }
        if (!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view nonFunctionalRequirements of this project");
        }
        return nfrMapper.toDto(nonFunctionalRequirement.get());
    }

    @Transactional
    public NonFunctionalRequirementDTO createNonFunctionalRequirement(String oryId, NonFunctionalRequirementDTO dto, Long projectId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to add a nonFunctionalRequirements to this project");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        NonFunctionalRequirement nfr = nfrMapper.toEntity(dto);
        nfr.setProject(project);
        nfr.setState(RequirementState.PENDING_APPROVAL);
        NonFunctionalRequirement saved = nfrRepository.save(nfr);

        return nfrMapper.toDto(saved);
    }
}