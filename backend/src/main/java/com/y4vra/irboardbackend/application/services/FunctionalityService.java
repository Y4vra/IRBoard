package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FunctionalityService {

    private final FunctionalityRepository functionalityRepository;
    private final ProjectRepository projectRepository;
    private final FunctionalityMapper functionalityMapper;
    private final KetoClient ketoClient;

    public FunctionalityService(FunctionalityRepository functionalityRepository, ProjectRepository projectRepository, FunctionalityMapper functionalityMapper,KetoClient ketoClient) {
        this.functionalityRepository = functionalityRepository;
        this.projectRepository = projectRepository;
        this.functionalityMapper = functionalityMapper;
        this.ketoClient = ketoClient;
    }

    @Transactional(readOnly = true)
    public List<FunctionalityDTO> findFunctionalitiesOfProjectForUser(String oryId, long projectId) {
        List<String> authorizedFunctionalityIds = ketoClient.getAuthorizedObjects(
                oryId,
                "Functionality",
                "viewRequirements"
        );

        List<Long> functionalityIds = authorizedFunctionalityIds.stream()
                .map(Long::valueOf)
                .toList();
        return functionalityRepository.findAllById(functionalityIds).stream()
                .filter(f -> f.getProject().getId() == projectId)
                .map(functionalityMapper::toDto)
                .collect(Collectors.toList());
    }
//    @Transactional
//    public FunctionalityDTO createFunctionality(FunctionalityDTO dto, long projectId, String oryId) {
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
//
//        Functionality functionality = new Functionality();
//        functionality.setName(dto.getName());
//        functionality.setProject(project);
//
//        String label = generateLabel(dto.getName());
//        functionality.setLabel(label);
//
//        Functionality saved = functionalityRepository.save(functionality);
//
//        ketoClient.createRelation("Functionality", String.valueOf(saved.getId()), "project", "Project:" + projectId);
//
//        return functionalityMapper.toDto(saved);
//    }
}