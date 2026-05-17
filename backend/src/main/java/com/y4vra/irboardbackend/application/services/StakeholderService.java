package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.StakeholderMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StakeholderService {

    private final StakeholderRepository stakeholderRepository;
    private final ProjectRepository projectRepository;
    private final StakeholderMapper stakeholderMapper;
    private final PermissionService permService;
    private final FunctionalityService functionalityService;
    private final EntityLockService entityLockService;

    public StakeholderService(StakeholderRepository stakeholderRepository,
                              ProjectRepository projectRepository,
                              StakeholderMapper stakeholderMapper,
                              PermissionService permService, FunctionalityService functionalityService, EntityLockService entityLockService) {
        this.stakeholderRepository = stakeholderRepository;
        this.projectRepository = projectRepository;
        this.stakeholderMapper = stakeholderMapper;
        this.permService = permService;
        this.functionalityService = functionalityService;
        this.entityLockService = entityLockService;
    }

    private void checkEditPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to edit stakeholders in this project");
        }
    }
    private void checkViewPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)){
            throw new AccessDeniedException("User not authorized to view stakeholders of this project");
        }
    }

    @Transactional(readOnly = true)
    public List<StakeholderDTO> findStakeholdersOfProject(String oryId, long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return stakeholderRepository.findByProjectId(projectId).stream()
                .map(stakeholderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StakeholderDTO createStakeholder(String oryId,StakeholderDTO dto, long projectId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        Stakeholder stakeholder = new Stakeholder();
        stakeholder.setName(dto.name());
        stakeholder.setDescription(dto.description());
        stakeholder.setProject(project);
        Associations.link(project, stakeholder);
        EntitySlugGenerator.setSlug(stakeholder,project.getId());
        stakeholder.setState(EntityState.PENDING_APPROVAL);

        Stakeholder saved = stakeholderRepository.save(stakeholder);
        return stakeholderMapper.toDto(saved);
    }
    @Transactional(readOnly = true)
    public StakeholderDTO findStakeholderById(String oryId, long projectId, long stakeholderId) {
        Set<Long> viewableFunctionalities = functionalityService.getViewableFunctionalityIds(oryId, projectId);
        Stakeholder stakeholder = stakeholderRepository.findById(stakeholderId)
                .orElseThrow(()-> new EntityNotFoundException("Stakeholder with id " + stakeholderId + " not found"));

        if(stakeholder.getProject().getId() != projectId){
            throw new EntityNotFoundException("Stakeholder with id " + stakeholderId + " not found");
        }
        checkViewPermission(oryId,String.valueOf(projectId));
        List<Requirement> observers = stakeholderRepository
                .findFilteredRequirementsForStakeholder(stakeholderId, viewableFunctionalities);
        return stakeholderMapper.toDtoWithObservers(stakeholder, observers);
    }

    @Transactional(readOnly = true)
    public List<StakeholderDTO> findObservableStakeholdersForRequirement(String oryId, long projectId, long requirementId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return stakeholderMapper.toDtoList(stakeholderRepository.findObservableStakeholdersForRequirement(projectId,requirementId));
    }

    @Transactional
    public void requestEdit(User user,Long projectId,Long stkhId) {
        checkEditPermission(user.getOryId(),String.valueOf(projectId));
        Stakeholder stakeholder = stakeholderRepository.findById(stkhId).orElseThrow(()->new EntityNotFoundException("User not found"));
        entityLockService.lock(stakeholder,user);
    }

    @Transactional
    public StakeholderDTO patch(User user,Long projectId,Long stkhId,StakeholderDTO patch) {
        checkEditPermission(user.getOryId(),String.valueOf(projectId));
        Stakeholder stakeholder = stakeholderRepository.findById(stkhId).orElseThrow(()->new EntityNotFoundException("User not found"));
        if(!entityLockService.isLockedByUser(stakeholder, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        stakeholderMapper.patchEntity(patch, stakeholder);
        stakeholder.setState(EntityState.PENDING_APPROVAL);
        entityLockService.unlock(stakeholder,user);
        stakeholder.notifyObservers();
        return stakeholderMapper.toDto(stakeholderRepository.save(stakeholder));
    }

    @Transactional
    public void approveStakeholders(String oryId, Long projectId, List<Long> stakeholderIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!stakeholderRepository.allStakeholdersBelongToProject(projectId,stakeholderIds))
            throw new EntityNotFoundException("One of the elements was not found on the system");
        stakeholderRepository.updateStateByIdsAndProject(stakeholderIds,projectId, EntityState.APPROVED,EntityState.PENDING_APPROVAL);
    }
}