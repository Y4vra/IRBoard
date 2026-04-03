package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.StakeholderMapper;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StakeholderService {

    private final StakeholderRepository stakeholderRepository;
    private final ProjectRepository projectRepository;
    private final StakeholderMapper stakeholderMapper;
    private final KetoClient ketoClient;

    public StakeholderService(StakeholderRepository stakeholderRepository,
                              ProjectRepository projectRepository,
                              StakeholderMapper stakeholderMapper,
                              KetoClient ketoClient) {
        this.stakeholderRepository = stakeholderRepository;
        this.projectRepository = projectRepository;
        this.stakeholderMapper = stakeholderMapper;
        this.ketoClient = ketoClient;
    }

    @Transactional(readOnly = true)
    public List<StakeholderDTO> findStakeholdersOfProject(String oryId, long projectId) {
        boolean hasProjectAccess = ketoClient.check("Project", String.valueOf(projectId), "view", oryId);

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

//    @Transactional
//    public void linkStakeholderToFunctionality(long stakeholderId, long functionalityId, String oryIdOfStakeholder) {
//        ketoClient.createRelation(
//                "Functionality",
//                String.valueOf(functionalityId),
//                "stakeholders",
//                oryIdOfStakeholder
//        );
//    }

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