package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
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
        List<String> stringIds = ketoClient.getAuthorizedObjects(oryId, "Project", "viewer");

        List<Long> longIds = stringIds.stream()
                .map(Long::valueOf)
                .toList();
        return projectRepository.findAllById(longIds).stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }
}