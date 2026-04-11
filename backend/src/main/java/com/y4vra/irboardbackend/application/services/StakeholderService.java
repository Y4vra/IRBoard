package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.StakeholderMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StakeholderService {

    private final StakeholderRepository stakeholderRepository;
    private final ProjectRepository projectRepository;
    private final StakeholderMapper stakeholderMapper;
    private final PermissionService permService;

    public StakeholderService(StakeholderRepository stakeholderRepository,
                              ProjectRepository projectRepository,
                              StakeholderMapper stakeholderMapper,
                              PermissionService permService) {
        this.stakeholderRepository = stakeholderRepository;
        this.projectRepository = projectRepository;
        this.stakeholderMapper = stakeholderMapper;
        this.permService = permService;
    }

    @Transactional(readOnly = true)
    public List<StakeholderDTO> findStakeholdersOfProject(String oryId, long projectId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view stakeholders of this project");
        }

        return stakeholderRepository.findByProjectId(projectId).stream()
                .map(stakeholderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StakeholderDTO createStakeholder(StakeholderDTO dto, long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setName(dto.name());
        stakeholder.setDescription(dto.description());
        stakeholder.setProject(project);

        Stakeholder saved = stakeholderRepository.save(stakeholder);
        return stakeholderMapper.toDto(saved);
    }

    @Transactional
    public void linkStakeholderToFunctionality(long stakeholderId, long functionalityId, String oryIdOfStakeholder) {
        permService.grantPermission(
                "Functionality",
                String.valueOf(functionalityId),
                "stakeholders",
                oryIdOfStakeholder
        );
    }

//    @Transactional
//    public StakeholderDTO deactivateStakeholder(long id) {
//        Stakeholder stakeholder = stakeholderRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Stakeholder not found"));
//
//        stakeholder.setDeactivated(true);
//
//        return stakeholderMapper.toDto(stakeholderRepository.save(stakeholder));
//    }
}