package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LabelConflictException;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.*;
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

    private void checkEditPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", projectId, "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to edit functionalities of this project");
        }
    }
    private void checkViewProjectPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", projectId, "view", oryId)) {
            throw new AccessDeniedException("User not authorized to edit functionalities of this project");
        }
    }
    private void checkViewFunctionalityPermission(String oryId,String functionalityId){
        if (!permService.checkPermission("Functionality", functionalityId, "viewRequirements", oryId)){
            throw new AccessDeniedException("You do not have permission to view this Functionality");
        }
    }
    private void checkProjectManagerPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "editProject", oryId)) {
            throw new AccessDeniedException("User not authorized to edit functionalities of this project");
        }
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
            FunctionalityDTO dto = functionalityMapper.toDto(f);
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
        Functionality functionality = functionalityRepository.findByIdAndProjectId(functionalityId,projectId).orElseThrow(()-> new EntityNotFoundException("Functionality with id " + functionalityId + " not found"));

        checkViewFunctionalityPermission(oryId,String.valueOf(functionalityId));
        return functionalityMapper.toDto(functionality);
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

        checkProjectManagerPermission(oryId,String.valueOf(projectId));

        Functionality functionality = functionalityMapper.toEntity(dto);
        Associations.link(project, functionality);
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
        return functionalityMapper.toDto(saved);
    }

    @Transactional
    public void requestEdit(User user, Long projectId, Long funcId) {
        checkProjectManagerPermission(user.getOryId(),String.valueOf(projectId));
        Functionality stakeholder = functionalityRepository.findByIdAndProjectId(funcId,projectId).orElseThrow(()->new EntityNotFoundException("User not found"));
        entityLockService.lock(stakeholder,user);
    }

    @Transactional
    public FunctionalityDTO patch(User user, Long projectId, Long funcId, FunctionalityDTO patch) {
        checkProjectManagerPermission(user.getOryId(),String.valueOf(projectId));
        Functionality functionality = functionalityRepository.findByIdAndProjectId(funcId,projectId).orElseThrow(()->new EntityNotFoundException("User not found"));
        if(!entityLockService.isLockedByUser(functionality, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        functionalityMapper.patchEntity(patch, functionality);
        entityLockService.unlock(functionality,user);
        return functionalityMapper.toDto(functionalityRepository.save(functionality));
    }
    @Transactional(readOnly = true)
    /**
     * Does not check permissions, use as data obtaining only
     */
    public List<Long> getRootRequirementIds(Long projectId, Long functionalityId) {
        return functionalityRepository.getActiveRootRequirementIds(projectId,functionalityId);
    }

    @Transactional
    public void disableFunctionality(String oryId, Long projectId, Long functionalityId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Functionality func = functionalityRepository.findByIdAndProjectIdAndStateNot(functionalityId,projectId,FunctionalityState.DEACTIVATED).orElseThrow(()->new EntityNotFoundException("Functionality of project not found"));
        func.setState(FunctionalityState.DEACTIVATED);
    }
    @Transactional
    public void enableFunctionality(String oryId, Long projectId, Long functionalityId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Functionality func = functionalityRepository.findByIdAndProjectIdAndState(functionalityId,projectId,FunctionalityState.DEACTIVATED).orElseThrow(()->new EntityNotFoundException("Functionality of project not found"));
        func.setState(FunctionalityState.ACTIVE);
    }
    @Transactional
    public void removeFunctionality(String oryId, Long projectId, Long functionalityId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        Functionality func = functionalityRepository.findByIdAndProjectIdAndState(functionalityId,projectId,FunctionalityState.DEACTIVATED).orElseThrow(()->new EntityNotFoundException("Functionality of project not found"));
        func.setState(FunctionalityState.REMOVED);
    }
    @Transactional
    public void deleteFunctionality(String oryId, Long projectId, Long functionalityId) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        if (functionalityRepository.deleteFunctionalityAndRequirementsInState(projectId,functionalityId,FunctionalityState.DEACTIVATED)<1){
            throw new EntityNotFoundException("Functionality of project not found");
        }
    }
}