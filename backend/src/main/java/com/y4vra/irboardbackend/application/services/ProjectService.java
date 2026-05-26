package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.mappers.ProjectMapper;
import com.y4vra.irboardbackend.application.ports.ObjectStorageService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.repositories.StatisticsRepository;
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
    private final StatisticsRepository statisticsRepository;
    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final ObjectStorageService objectStorageService;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper, PermissionService permService, EntityLockService entityLockService, StatisticsRepository statisticsRepository, DocumentService documentService, DocumentRepository documentRepository, ObjectStorageService objectStorageService) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.permService = permService;
        this.entityLockService = entityLockService;
        this.statisticsRepository = statisticsRepository;
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.objectStorageService = objectStorageService;
    }

    private void checkEditPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to edit this project");
        }
    }
    private void checkViewPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view this project");
        }
    }
    private void checkProjectManagerPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "editProject", oryId)) {
            throw new AccessDeniedException("User not authorized to perform this action on this project");
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> findAllProjectsNotRemoved() {
        return projectRepository.findAllByStateNot(ProjectState.REMOVED)
                .stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<ProjectDTO> findAllProjectsRemoved() {
        return projectRepository.findAllByState(ProjectState.REMOVED)
                .stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> findProjectsForUser(String oryId) {
        List<String> allProjectIds = projectRepository.findAllIds()
                .stream()
                .map(String::valueOf)
                .toList();

        List<String> authorizedIds = permService.filterAuthorizedObjects(
                oryId, "Project", "view", allProjectIds
        );

        return projectRepository.findAllById(
                        authorizedIds.stream().map(Long::valueOf).toList()
                ).stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO, String oryId) {
        Project project = new Project(projectDTO.name(),projectDTO.description(),projectDTO.priorityStyle());
        Project savedProject = projectRepository.save(project);
        permService.grantPermission("Project", String.valueOf(savedProject.getId()), "managers", oryId);
        permService.grantPermissionToSubjectSet("Project", String.valueOf(savedProject.getId()), "parent_system", "System", "main", "admins");

        return projectMapper.toDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectDTO findById(String oryId, long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        Project project =projectRepository.findById(
                projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        return projectMapper.toDto(project,
                permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId),
                statisticsRepository.getStakeholderStatistics(projectId),
                statisticsRepository.getDocumentStatistics(projectId),
                statisticsRepository.getNonFunctionalRequirementStatistics(projectId),
                statisticsRepository.getFunctionalitiesStatistics(projectId));
    }

    @Transactional
    public void requestEdit(Long id, User user) {
        Project project = projectRepository.findByIdAndState(id, ProjectState.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        entityLockService.lock(project, user); // throws LockableEntityException if locked by another
    }

    @Transactional
    public ProjectDTO patch(Long id, ProjectDTO patch, User user) {
        Project project = projectRepository.findByIdAndState(id, ProjectState.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Project not found or not able to be modified"));

        if (!entityLockService.isLockedByUser(project, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        projectMapper.patchEntity(patch,project);
        entityLockService.unlock(project,user);
        return projectMapper.toDto(projectRepository.save(project));
    }
    @Transactional
    public void approveAllElements(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE).orElseThrow(() -> new EntityNotFoundException("Project not found or not able to be modified"));
        projectRepository.approveAllElementsInProject(projectId);
    }

    @Transactional
    public void finishActiveProject(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Project project = projectRepository.findByIdAndState(projectId, ProjectState.ACTIVE).orElseThrow(()-> new EntityNotFoundException("Project not found or not able to be modified"));
        projectRepository.checkAllElementsAreFinished(projectId);

        project.setState(ProjectState.FINISHED);
    }
    @Transactional
    public void disableProject(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Project project = projectRepository.findByIdAndStates(projectId, List.of(ProjectState.ACTIVE,ProjectState.REMOVED)).orElseThrow(()-> new EntityNotFoundException("Project not found or not able to be modified"));

        project.setState(ProjectState.DEACTIVATED);
    }
    @Transactional
    public void enableProject(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Project project = projectRepository.findByIdAndStates(projectId,List.of(ProjectState.FINISHED,ProjectState.DEACTIVATED)).orElseThrow(()-> new EntityNotFoundException("Project not found or not able to be modified"));

        project.setState(ProjectState.ACTIVE);
    }
    @Transactional
    public void removeProject(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Project project = projectRepository.findByIdAndState(projectId,ProjectState.DEACTIVATED).orElseThrow(()-> new EntityNotFoundException("Project not found or not able to be modified"));

        project.setState(ProjectState.REMOVED);
    }
    @Transactional
    public void deleteProject(String oryId, Long projectId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        projectRepository.findByIdAndState(projectId,ProjectState.REMOVED).orElseThrow(()-> new EntityNotFoundException("Project not found or not able to be modified"));

        permService.removeAllTuplesForSubject(String.valueOf(projectId));

        documentRepository.findAllObjectStorageKeysByProjectId(projectId).forEach(objectStorageService::deleteFile);

        projectRepository.deleteByIdAndState(projectId,ProjectState.REMOVED);
    }
}