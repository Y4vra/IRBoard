package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final KetoClient ketoClient;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper,KetoClient ketoClient) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.ketoClient = ketoClient;
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> findAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> findProjectsForUser(String oryId) {
        List<String> stringIds = ketoClient.getAuthorizedObjects(oryId, "Project", "view");

        List<Long> longIds = stringIds.stream()
                .map(Long::valueOf)
                .toList();
        return projectRepository.findAllById(longIds).stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO, String oryId) {
        Project project = new Project(projectDTO.name(),projectDTO.description(),projectDTO.priorityStyle());
        Project savedProject = projectRepository.save(project);
        ketoClient.createRelation("Project", String.valueOf(savedProject.getId()), "managers", oryId);

        return projectMapper.toDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectDTO findById(String oryId, long id) {
        boolean isAuthorized = ketoClient.check("Project", String.valueOf(id), "view", oryId);
        if (!isAuthorized) {
            throw new AccessDeniedException("User not authorized to view this project");
        }
        return projectRepository.findById(id)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }
}