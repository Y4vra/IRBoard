package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.RequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

public abstract class RequirementService {

    protected final PermissionService permService;
    protected final StakeholderRepository stakeholderRepository;
    protected final DocumentRepository documentRepository;
    protected final NonFunctionalRequirementRepository nfrRepository;
    protected final RequirementRepository requirementRepository;
    protected final EntityLockService entityLockService;

    public RequirementService(PermissionService permService,StakeholderRepository stakeholderRepository,DocumentRepository documentRepository,NonFunctionalRequirementRepository nonFunctionalRequirementRepository,RequirementRepository requirementRepository,EntityLockService entityLockService) {
        this.permService = permService;
        this.stakeholderRepository = stakeholderRepository;
        this.documentRepository = documentRepository;
        this.nfrRepository = nonFunctionalRequirementRepository;
        this.requirementRepository = requirementRepository;
        this.entityLockService = entityLockService;
    }

    protected void checkProjectManagerPermission(String oryId, String projectId) {
        if (!permService.checkPermission("Project", projectId, "editProject", oryId)) {
            throw new AccessDeniedException("User not authorized to perform this action on this project");
        }
    }

    @Transactional
    public void requestEdit(User user,Long projectId,Long requirementId) {
        checkProjectManagerPermission(user.getOryId(),String.valueOf(projectId));
        Requirement requirement = requirementRepository.findById(requirementId).orElseThrow(()->new EntityNotFoundException("Requirement not found"));
        requirement.checkCanBeModified();
        entityLockService.lock(requirement,user);
    }
}
