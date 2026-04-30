package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
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
    private final PermissionService permService;
    private final EntityLockService entityLockService;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper,PermissionService permService, EntityLockService entityLockService) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.permService = permService;
        this.entityLockService = entityLockService;
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
        List<String> stringIds = permService.getAuthorizedObjects(oryId, "Project", "view");

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
        permService.grantPermission("Project", String.valueOf(savedProject.getId()), "managers", oryId);

        return projectMapper.toDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectDTO findById(String oryId, long id) {
        boolean isAuthorized = permService.checkPermission("Project", String.valueOf(id), "view", oryId);
        if (!isAuthorized) {
            throw new AccessDeniedException("User not authorized to view this project");
        }
        return projectRepository.findById(id)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    @Transactional
    public void requestEdit(Long id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        entityLockService.lock(project, user); // throws LockableEntityException if locked by another
    }

    @Transactional
    public ProjectDTO patch(Long id, ProjectDTO patch, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        if (!entityLockService.isLockedByUser(project, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }

        if (patch.name() != null) project.setName(patch.name());
        if (patch.description() != null) project.setDescription(patch.description());
        if (patch.priorityStyle() != null) project.setPriorityStyle(PriorityStyle.valueOf(patch.priorityStyle()));

        return projectMapper.toDto(projectRepository.save(project));
    }
}