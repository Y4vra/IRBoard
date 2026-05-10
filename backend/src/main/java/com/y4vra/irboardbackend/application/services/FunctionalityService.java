package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LabelConflictException;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FunctionalityService {

    private final FunctionalityRepository functionalityRepository;
    private final ProjectRepository projectRepository;
    private final FunctionalityMapper functionalityMapper;
    private final PermissionService permService;
    private final EntityLockService entityLockService;

    public FunctionalityService(FunctionalityRepository functionalityRepository, ProjectRepository projectRepository, FunctionalityMapper functionalityMapper, PermissionService permService, EntityLockService entityLockService) {
        this.functionalityRepository = functionalityRepository;
        this.projectRepository = projectRepository;
        this.functionalityMapper = functionalityMapper;
        this.permService = permService;
        this.entityLockService = entityLockService;
    }

    @Transactional(readOnly = true)
    public Map<String, List<FunctionalityDTO>> findFunctionalitiesOfProjectForUser(String oryId, long projectId) {
        List<Functionality> allProjectFunctionalities = functionalityRepository.findByProjectId(projectId);

        boolean canEditProject = permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId);
        boolean canViewProject = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        Map<String, List<FunctionalityDTO>> result = new HashMap<>();
        result.put("edit", new ArrayList<>());
        result.put("view", new ArrayList<>());
        result.put("none", new ArrayList<>());

        for (Functionality f : allProjectFunctionalities) {
            FunctionalityDTO dto = functionalityMapper.toDto(f,false);
            String fId = String.valueOf(f.getId());

            if (canEditProject || permService.checkPermission("Functionality", fId, "editRequirements", oryId)) {
                result.get("edit").add(dto);
            } else if (canViewProject || permService.checkPermission("Functionality", fId, "viewRequirements", oryId)) {
                result.get("view").add(dto);
            } else {
                result.get("none").add(dto);
            }
        }

        return result;
    }
    @Transactional(readOnly = true)
    public FunctionalityDTO findFunctionalityById(String oryId, long projectId, long functionalityId) {
        Optional<Functionality> functionality = functionalityRepository.findById(functionalityId);

        if(functionality.isEmpty()) {
            throw new EntityNotFoundException("Functionality with id " + functionalityId + " not found");
        }
        if(functionality.get().getProject().getId() != projectId){
            throw new EntityNotFoundException("Functionality with id " + functionalityId + " not found");
        }
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "viewRequirements", oryId)){
            throw new AccessDeniedException("You do not have permission to view this Functionality");
        }
        return functionalityMapper.toDto(functionality.get(),permService.checkPermission("Project",String.valueOf(projectId),"linkProjectUsers",oryId));
    }
    @Transactional(readOnly = true)
    public Set<Long> getViewableFunctionalityIds(String oryId, long projectId) {
        Set<Long> ids = Stream.concat(
                permService.getAuthorizedObjects(oryId, "Functionality", "stakeholders").stream(),
                permService.getAuthorizedObjects(oryId, "Functionality", "engineers").stream()
        ).map(Long::parseLong).collect(Collectors.toSet());

        boolean hasProjectAccess =
                !permService.getAuthorizedObjects(oryId, "Project", "managers").isEmpty() ||
                        !permService.getAuthorizedObjects(oryId, "System", "admins").isEmpty();

        if (hasProjectAccess) {
            ids.addAll(functionalityRepository.findIdsByProjectId(projectId));
        }

        return ids;
    }

    @Transactional
    public FunctionalityDTO createFunctionality(FunctionalityDTO dto, long projectId, String oryId) {
        if(dto.projectId() != projectId){
            throw new IllegalArgumentException("Attempt to add a functionality to different project than the one being edited.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        boolean isAllowed = permService.checkPermission("Project", String.valueOf(projectId), "editProject", oryId);

        if (!isAllowed) {
            throw new AccessDeniedException("User not authorized to add functionalities to this project");
        }

        Functionality functionality = functionalityMapper.toEntity(dto);
        functionality.setProjectId(projectId);
        EntitySlugGenerator.setSlug(functionality,projectId);
        functionality.setProject(project);
        functionality.setState(FunctionalityState.ACTIVE);

        Functionality saved;
        try{
            saved= functionalityRepository.save(functionality);
        } catch (DataIntegrityViolationException e) {
            throw new LabelConflictException("A functionality with label '" + functionality.getLabel() + "' already exists in this project.",e);
        }
        permService.grantPermissionToSubjectSet("Project", String.valueOf(projectId), "functionalities", "Functionality", String.valueOf(saved.getId()), "project");
        permService.grantPermissionToSubjectSet("Functionality", String.valueOf(saved.getId()), "project","Project", String.valueOf(projectId), "functionalities");
        return functionalityMapper.toDto(saved,true);
    }

    @Transactional
    public void requestEdit(User user, Long projectId, Long funcId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", user.getOryId())) {
            throw new AccessDeniedException("User not authorized to edit functionalities of this project");
        }
        Functionality stakeholder = functionalityRepository.findById(funcId).orElseThrow(()->new EntityNotFoundException("User not found"));
        entityLockService.lock(stakeholder,user);
    }

    @Transactional
    public FunctionalityDTO patch(User user, Long projectId, Long funcId, FunctionalityDTO patch) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", user.getOryId())) {
            throw new AccessDeniedException("User not authorized to edit functionalities of this project");
        }
        Functionality functionality = functionalityRepository.findById(funcId).orElseThrow(()->new EntityNotFoundException("User not found"));
        if(!entityLockService.isLockedByUser(functionality, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        functionalityMapper.patchEntity(patch, functionality);
        entityLockService.unlock(functionality,user);
        return functionalityMapper.toDto(functionalityRepository.save(functionality),true);
    }
}